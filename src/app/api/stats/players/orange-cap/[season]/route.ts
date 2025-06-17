import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../../lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { season: string } }
) {
   try {
      const season = parseInt(params.season);

      if (isNaN(season)) {
         return NextResponse.json({ error: "Invalid season" }, { status: 400 });
      }

      // Get Orange Cap holder (highest run scorer)
      const [orangeCapData] = await db.execute(
         `SELECT 
        p.player_id,
        p.name,
        p.jersey_number,
        t.name as team_name,
        t.short_name as team_short,
        t.primary_color,
        COUNT(DISTINCT m.match_id) as matches_played,
        COUNT(DISTINCT CASE WHEN bs.is_out = TRUE THEN bs.match_id END) as innings_played,
        SUM(bs.runs_scored) as total_runs,
        COUNT(bs.ball_id) as total_balls,
        SUM(CASE WHEN bs.runs_scored = 4 THEN 1 ELSE 0 END) as total_fours,
        SUM(CASE WHEN bs.runs_scored = 6 THEN 1 ELSE 0 END) as total_sixes,
        ROUND(SUM(bs.runs_scored) / NULLIF(COUNT(DISTINCT CASE WHEN bs.is_out = TRUE THEN bs.match_id END), 0), 2) as batting_average,
        ROUND(SUM(bs.runs_scored) * 100.0 / NULLIF(COUNT(bs.ball_id), 0), 2) as strike_rate,
        MAX(CASE 
          WHEN bs.is_out = TRUE THEN 
            (SELECT SUM(bs2.runs_scored) 
             FROM batting_scorecards bs2 
             WHERE bs2.player_id = bs.player_id 
             AND bs2.match_id = bs.match_id 
             AND bs2.innings_number = bs.innings_number)
        END) as highest_score
      FROM players p
      JOIN batting_scorecards bs ON p.player_id = bs.player_id
      JOIN matches m ON bs.match_id = m.match_id
      JOIN teams t ON p.current_team_id = t.team_id
      WHERE m.season_year = ?
      GROUP BY p.player_id, p.name, p.jersey_number, t.name, t.short_name, t.primary_color
      ORDER BY total_runs DESC
      LIMIT 1`,
         [season]
      );

      if (!(orangeCapData as any[]).length) {
         return NextResponse.json(
            { error: "No batting data found for this season" },
            { status: 404 }
         );
      }

      const orangeCapHolder = (orangeCapData as any[])[0];

      // Get top 10 run scorers for context
      const [topScorers] = await db.execute(
         `SELECT 
        p.player_id,
        p.name,
        t.name as team_name,
        t.short_name as team_short,
        SUM(bs.runs_scored) as total_runs,
        COUNT(DISTINCT m.match_id) as matches_played,
        ROUND(SUM(bs.runs_scored) / NULLIF(COUNT(DISTINCT CASE WHEN bs.is_out = TRUE THEN bs.match_id END), 0), 2) as batting_average,
        ROUND(SUM(bs.runs_scored) * 100.0 / NULLIF(COUNT(bs.ball_id), 0), 2) as strike_rate
      FROM players p
      JOIN batting_scorecards bs ON p.player_id = bs.player_id
      JOIN matches m ON bs.match_id = m.match_id
      JOIN teams t ON p.current_team_id = t.team_id
      WHERE m.season_year = ?
      GROUP BY p.player_id, p.name, t.name, t.short_name
      ORDER BY total_runs DESC
      LIMIT 10`,
         [season]
      );

      // Get match-by-match progression for the Orange Cap holder
      const [progression] = await db.execute(
         `SELECT 
         m.match_id,
         m.match_date,
         CONCAT(t1.short_name, ' vs ', t2.short_name) as match_title,
         SUM(bs.runs_scored) as runs_in_match,
         SUM(SUM(bs.runs_scored)) OVER (ORDER BY m.match_date, m.match_id) as cumulative_runs
         FROM matches m
         JOIN batting_scorecards bs ON m.match_id = bs.match_id
         JOIN teams t1 ON m.team1_id = t1.team_id
         JOIN teams t2 ON m.team2_id = t2.team_id
         WHERE bs.player_id = ? AND m.season_year = ?
         GROUP BY m.match_id, m.match_date, m.match_number, t1.short_name, t2.short_name
         ORDER BY m.match_date, m.match_id`,
         [orangeCapHolder.player_id, season]
      );

      return NextResponse.json({
         success: true,
         data: {
            season,
            orange_cap_holder: orangeCapHolder,
            top_scorers: topScorers,
            progression,
            race_info: {
               total_matches_played: orangeCapHolder.matches_played,
               runs_lead:
                  orangeCapHolder.total_runs -
                  ((topScorers as any[])[1]?.total_runs || 0),
               next_challenger: (topScorers as any[])[1] || null,
            },
         },
      });
   } catch (error) {
      console.error("Error fetching Orange Cap data:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
