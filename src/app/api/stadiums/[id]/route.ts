import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {

      // Get stadium details
      const [stadiumRows] = await pool.execute(
         `
      SELECT * FROM Stadiums WHERE stadium_id = ?
    `,
         [params.id]
      );

      if (!stadiumRows || (stadiumRows as any[]).length === 0) {
         return NextResponse.json(
            { error: "Stadium not found" },
            { status: 404 }
         );
      }

      const stadium = (stadiumRows as any[])[0];

      // Get matches played at this stadium
      const [matchRows] = await pool.execute(
         `
      SELECT 
        m.*,
        t1.team_name as team1_name,
        t1.team_code as team1_short,
        t1.team_color as team1_logo,
        t2.team_name as team2_name,
        t2.team_code as team2_short,
        t2.team_color as team2_logo,
        wt.team_name as winner_name,
        wt.team_code as winner_short,
        sr.series_name as series_name,
        sr.season_year as series_year
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      LEFT JOIN Teams wt ON m.winner_id = wt.team_id
      JOIN Series sr ON m.series_id = sr.series_id
      WHERE m.stadium_id = ?
      ORDER BY m.match_date DESC
    `,
         [params.id]
      );

      // Get stadium statistics
      const [statsRows] = await pool.execute(
         `
      SELECT 
        COUNT(*) as total_matches,
        COUNT(CASE WHEN winner_id IS NOT NULL THEN 1 END) as completed_matches,
        COUNT(CASE WHEN toss_winner_id = team1_id AND winner_id = team1_id THEN 1 END) +
        COUNT(CASE WHEN toss_winner_id = team2_id AND winner_id = team2_id THEN 1 END) as toss_win_advantage,
        AVG(CASE WHEN win_type = 'runs' THEN win_margin END) as avg_runs_margin,
        AVG(CASE WHEN win_type = 'wickets' THEN win_margin END) as avg_wickets_margin
      FROM Matches 
      WHERE stadium_id = ?
    `,
         [params.id]
      );

      // Get team performance at this stadium
      const [teamStatsRows] = await pool.execute(
         `
      SELECT 
        t.team_id,
        t.team_name,
        t.team_code,
        t.team_color,
        COUNT(*) as matches_played,
        COUNT(CASE WHEN m.winner_id = t.team_id THEN 1 END) as wins,
        COUNT(CASE WHEN m.winner_id IS NOT NULL AND m.winner_id != t.team_id THEN 1 END) as losses
      FROM Teams t
      JOIN (
        SELECT team1_id as team_id, winner_id, match_id FROM Matches WHERE stadium_id = ?
        UNION ALL
        SELECT team2_id as team_id, winner_id, match_id FROM Matches WHERE stadium_id = ?
      ) m ON t.team_id = m.team_id
      GROUP BY t.team_id, t.team_name, t.team_code, t.team_color
      HAVING matches_played > 0
      ORDER BY wins DESC, matches_played DESC
    `,
         [params.id, params.id]
      );

      const stats = (statsRows as any[])[0];

      return NextResponse.json({
         stadium,
         matches: matchRows,
         statistics: {
            total_matches: stats.total_matches,
            completed_matches: stats.completed_matches,
            completion_rate:
               stats.total_matches > 0
                  ? (
                       (stats.completed_matches / stats.total_matches) *
                       100
                    ).toFixed(1)
                  : "0",
            toss_advantage:
               stats.total_matches > 0
                  ? (
                       (stats.toss_win_advantage / stats.completed_matches) *
                       100
                    ).toFixed(1)
                  : "0",
            avg_runs_margin: stats.avg_runs_margin
               ? Math.round(stats.avg_runs_margin)
               : null,
            avg_wickets_margin: stats.avg_wickets_margin
               ? Math.round(stats.avg_wickets_margin)
               : null,
         },
         team_performance: teamStatsRows,
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
