import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/players/[id]/stats - Get player statistics
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const playerId = parseInt(params.id);
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");

      // Get player info
      const playerQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        p.batting_style,
        p.bowling_style,
        p.date_of_birth,
        p.nationality,
        t.team_name,
        t.team_code,
        TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age
      FROM players p
      LEFT JOIN teams t ON p.current_team_id = t.team_id
      WHERE p.player_id = ?
    `;

      const [playerInfo] = await pool.execute(playerQuery, [playerId]);

      if ((playerInfo as any[]).length === 0) {
         return NextResponse.json(
            { success: false, error: "Player not found" },
            { status: 404 }
         );
      }

      const player = (playerInfo as any[])[0];

      // Build season filter
      let seasonFilter = "";
      let seasonParams: any[] = [playerId];

      if (season) {
         seasonFilter = "AND se.season = ?";
         seasonParams.push(season);
      }

      // Get batting statistics
      const battingStatsQuery = `
      SELECT 
        COUNT(DISTINCT bs.match_id) as matches_played,
        SUM(bs.runs_scored) as total_runs,
        AVG(bs.runs_scored) as avg_runs,
        MAX(bs.runs_scored) as highest_score,
        SUM(bs.balls_faced) as total_balls_faced,
        SUM(bs.fours) as total_fours,
        SUM(bs.sixes) as total_sixes,
        SUM(CASE WHEN bs.runs_scored >= 50 THEN 1 ELSE 0 END) as fifties,
        SUM(CASE WHEN bs.runs_scored >= 100 THEN 1 ELSE 0 END) as hundreds,
        SUM(CASE WHEN bs.dismissal_type = 'not out' THEN 1 ELSE 0 END) as not_outs,
        CASE 
          WHEN SUM(bs.balls_faced) > 0 
          THEN ROUND((SUM(bs.runs_scored) * 100.0) / SUM(bs.balls_faced), 2)
          ELSE 0 
        END as strike_rate,
        CASE 
          WHEN (COUNT(DISTINCT bs.match_id) - SUM(CASE WHEN bs.dismissal_type = 'not out' THEN 1 ELSE 0 END)) > 0
          THEN ROUND(SUM(bs.runs_scored) / (COUNT(DISTINCT bs.match_id) - SUM(CASE WHEN bs.dismissal_type = 'not out' THEN 1 ELSE 0 END)), 2)
          ELSE SUM(bs.runs_scored)
        END as batting_average
      FROM batting_scorecards bs
      JOIN matches m ON bs.match_id = m.match_id
      JOIN series se ON m.series_id = se.series_id
      WHERE bs.player_id = ? 
        AND m.status = 'completed'
        ${seasonFilter}
    `;

      const [battingStats] = await pool.execute(
         battingStatsQuery,
         seasonParams
      );

      // Get bowling statistics
      const bowlingStatsQuery = `
      SELECT 
        COUNT(DISTINCT bs.match_id) as matches_bowled,
        SUM(bs.wickets_taken) as total_wickets,
        SUM(bs.overs_bowled) as total_overs,
        SUM(bs.runs_conceded) as total_runs_conceded,
        MAX(bs.wickets_taken) as best_bowling_figures,
        SUM(CASE WHEN bs.wickets_taken >= 3 THEN 1 ELSE 0 END) as three_wickets_hauls,
        SUM(CASE WHEN bs.wickets_taken >= 5 THEN 1 ELSE 0 END) as five_wickets_hauls,
        CASE 
          WHEN SUM(bs.overs_bowled) > 0 
          THEN ROUND(SUM(bs.runs_conceded) / SUM(bs.overs_bowled), 2)
          ELSE 0 
        END as economy_rate,
        CASE 
          WHEN SUM(bs.wickets_taken) > 0 
          THEN ROUND(SUM(bs.runs_conceded) / SUM(bs.wickets_taken), 2)
          ELSE 0 
        END as bowling_average,
        CASE 
          WHEN SUM(bs.wickets_taken) > 0 
          THEN ROUND((SUM(bs.overs_bowled) * 6) / SUM(bs.wickets_taken), 2)
          ELSE 0 
        END as bowling_strike_rate
      FROM bowling_scorecards bs
      JOIN matches m ON bs.match_id = m.match_id
      JOIN series se ON m.series_id = se.series_id
      WHERE bs.player_id = ? 
        AND m.status = 'completed'
        AND bs.overs_bowled > 0
        ${seasonFilter}
    `;

      const [bowlingStats] = await pool.execute(
         bowlingStatsQuery,
         seasonParams
      );

      // Get career milestone achievements
      const milestonesQuery = `
      SELECT 
        'batting' as category,
        'Highest Score' as milestone,
        MAX(bs.runs_scored) as value,
        m.match_date,
        CONCAT(t1.team_name, ' vs ', t2.team_name) as match_details
      FROM batting_scorecards bs
      JOIN matches m ON bs.match_id = m.match_id
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN series se ON m.series_id = se.series_id
      WHERE bs.player_id = ? 
        AND m.status = 'completed'
        ${seasonFilter}
        AND bs.runs_scored = (
          SELECT MAX(runs_scored) 
          FROM batting_scorecards bs2 
          JOIN matches m2 ON bs2.match_id = m2.match_id
          JOIN series se2 ON m2.series_id = se2.series_id
          WHERE bs2.player_id = ? 
            AND m2.status = 'completed'
            ${seasonFilter ? "AND se2.season = ?" : ""}
        )
      UNION ALL
      SELECT 
        'bowling' as category,
        'Best Bowling' as milestone,
        MAX(bs.wickets_taken) as value,
        m.match_date,
        CONCAT(t1.team_name, ' vs ', t2.team_name) as match_details
      FROM bowling_scorecards bs
      JOIN matches m ON bs.match_id = m.match_id
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN series se ON m.series_id = se.series_id
      WHERE bs.player_id = ? 
        AND m.status = 'completed'
        AND bs.overs_bowled > 0
        ${seasonFilter}
        AND bs.wickets_taken = (
          SELECT MAX(wickets_taken) 
          FROM bowling_scorecards bs2 
          JOIN matches m2 ON bs2.match_id = m2.match_id
          JOIN series se2 ON m2.series_id = se2.series_id
          WHERE bs2.player_id = ? 
            AND m2.status = 'completed'
            AND bs2.overs_bowled > 0
            ${seasonFilter ? "AND se2.season = ?" : ""}
        )
      ORDER BY match_date DESC
    `;

      const milestonesParams: any[] = [playerId, playerId];
      if (season) {
         milestonesParams.push(season);
      }
      milestonesParams.push(playerId, playerId);
      if (season) {
         milestonesParams.push(season);
      }

      const [milestones] = await pool.execute(
         milestonesQuery,
         milestonesParams
      );

      return NextResponse.json({
         success: true,
         data: {
            player,
            batting_stats: (battingStats as any[])[0],
            bowling_stats: (bowlingStats as any[])[0],
            career_milestones: milestones,
            season: season || "career",
         },
      });
   } catch (error) {
      console.error("Player stats error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch player statistics" },
         { status: 500 }
      );
   }
}
