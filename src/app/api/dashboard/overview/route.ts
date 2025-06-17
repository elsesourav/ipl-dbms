import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/dashboard/overview - Get dashboard overview stats
export async function GET(request: NextRequest) {
   try {
      // Get current season overview
      const overviewQuery = `
      SELECT 
        (SELECT COUNT(*) FROM teams WHERE is_active = true) as total_teams,
        (SELECT COUNT(*) FROM players WHERE is_active = true) as total_players,
        (SELECT COUNT(*) FROM matches WHERE status = 'completed') as completed_matches,
        (SELECT COUNT(*) FROM matches WHERE status = 'upcoming') as upcoming_matches,
        (SELECT COUNT(*) FROM matches WHERE status = 'live') as live_matches,
        (SELECT COUNT(*) FROM stadiums WHERE is_active = true) as total_stadiums,
        (SELECT COUNT(*) FROM users WHERE is_active = true) as total_users,
        (SELECT season FROM series WHERE is_active = true LIMIT 1) as current_season
    `;

      const [overview] = await pool.execute(overviewQuery);

      // Get recent matches
      const recentMatchesQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.match_time,
        m.status,
        m.result,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        s.stadium_name,
        s.city
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      WHERE m.status IN ('completed', 'live')
      ORDER BY m.match_date DESC, m.match_time DESC
      LIMIT 5
    `;

      const [recentMatches] = await pool.execute(recentMatchesQuery);

      // Get top performers
      const topBatsmenQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        t.team_name,
        t.team_code,
        SUM(bs.runs_scored) as total_runs,
        AVG(bs.runs_scored) as avg_runs,
        MAX(bs.runs_scored) as highest_score,
        SUM(CASE WHEN bs.runs_scored >= 50 THEN 1 ELSE 0 END) as fifties_plus
      FROM batting_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON bs.match_id = m.match_id
      WHERE m.status = 'completed'
      GROUP BY p.player_id, p.player_name, t.team_name, t.team_code
      ORDER BY total_runs DESC
      LIMIT 5
    `;

      const [topBatsmen] = await pool.execute(topBatsmenQuery);

      const topBowlersQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        t.team_name,
        t.team_code,
        SUM(bs.wickets_taken) as total_wickets,
        AVG(bs.runs_conceded / bs.overs_bowled) as economy_rate,
        MIN(CASE WHEN bs.wickets_taken > 0 THEN bs.runs_conceded ELSE NULL END) as best_figures,
        SUM(CASE WHEN bs.wickets_taken >= 3 THEN 1 ELSE 0 END) as three_wickets_plus
      FROM bowling_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON bs.match_id = m.match_id
      WHERE m.status = 'completed' AND bs.overs_bowled > 0
      GROUP BY p.player_id, p.player_name, t.team_name, t.team_code
      ORDER BY total_wickets DESC, economy_rate ASC
      LIMIT 5
    `;

      const [topBowlers] = await pool.execute(topBowlersQuery);

      return NextResponse.json({
         success: true,
         data: {
            overview: overview[0],
            recentMatches,
            topBatsmen,
            topBowlers,
         },
      });
   } catch (error) {
      console.error("Dashboard overview error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch dashboard overview" },
         { status: 500 }
      );
   }
}
