import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/dashboard/trending-players - Get trending/performing players
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "10");
      const days = parseInt(searchParams.get("days") || "30"); // Last N days for trending

      // Get trending batsmen based on recent performance
      const trendingBatsmenQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        t.team_name,
        t.team_code,
        t.primary_color,
        COUNT(DISTINCT m.match_id) as recent_matches,
        SUM(bs.runs_scored) as total_runs,
        AVG(bs.runs_scored) as avg_runs,
        MAX(bs.runs_scored) as highest_score,
        SUM(bs.fours) as total_fours,
        SUM(bs.sixes) as total_sixes,
        AVG(CASE WHEN bs.balls_faced > 0 THEN (bs.runs_scored * 100.0) / bs.balls_faced ELSE 0 END) as strike_rate,
        SUM(CASE WHEN bs.runs_scored >= 50 THEN 1 ELSE 0 END) as fifties_plus,
        SUM(CASE WHEN bs.runs_scored >= 100 THEN 1 ELSE 0 END) as hundreds
      FROM batting_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON bs.match_id = m.match_id
      WHERE m.match_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND m.status = 'completed'
        AND p.is_active = true
      GROUP BY p.player_id, p.player_name, p.role, t.team_name, t.team_code, t.primary_color
      HAVING recent_matches >= 2 AND total_runs > 0
      ORDER BY total_runs DESC, avg_runs DESC
      LIMIT ?
    `;

      const [trendingBatsmen] = await pool.execute(trendingBatsmenQuery, [
         days,
         limit,
      ]);

      // Get trending bowlers based on recent performance
      const trendingBowlersQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        t.team_name,
        t.team_code,
        t.primary_color,
        COUNT(DISTINCT m.match_id) as recent_matches,
        SUM(bs.wickets_taken) as total_wickets,
        AVG(bs.wickets_taken) as avg_wickets,
        SUM(bs.overs_bowled) as total_overs,
        SUM(bs.runs_conceded) as total_runs_conceded,
        AVG(CASE WHEN bs.overs_bowled > 0 THEN bs.runs_conceded / bs.overs_bowled ELSE 0 END) as economy_rate,
        MIN(CASE WHEN bs.wickets_taken > 0 THEN bs.runs_conceded ELSE NULL END) as best_figures,
        SUM(CASE WHEN bs.wickets_taken >= 3 THEN 1 ELSE 0 END) as three_wickets_plus,
        SUM(CASE WHEN bs.wickets_taken >= 5 THEN 1 ELSE 0 END) as five_wickets_plus
      FROM bowling_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON bs.match_id = m.match_id
      WHERE m.match_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND m.status = 'completed'
        AND p.is_active = true
        AND bs.overs_bowled > 0
      GROUP BY p.player_id, p.player_name, p.role, t.team_name, t.team_code, t.primary_color
      HAVING recent_matches >= 2
      ORDER BY total_wickets DESC, economy_rate ASC
      LIMIT ?
    `;

      const [trendingBowlers] = await pool.execute(trendingBowlersQuery, [
         days,
         limit,
      ]);

      // Get most impactful all-rounders
      const trendingAllRoundersQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        t.team_name,
        t.team_code,
        t.primary_color,
        COUNT(DISTINCT m.match_id) as recent_matches,
        COALESCE(SUM(bs.runs_scored), 0) as total_runs,
        COALESCE(AVG(bs.runs_scored), 0) as avg_runs,
        COALESCE(SUM(bow.wickets_taken), 0) as total_wickets,
        COALESCE(AVG(bow.wickets_taken), 0) as avg_wickets,
        COALESCE(AVG(CASE WHEN bow.overs_bowled > 0 THEN bow.runs_conceded / bow.overs_bowled ELSE 0 END), 0) as economy_rate,
        (COALESCE(SUM(bs.runs_scored), 0) + (COALESCE(SUM(bow.wickets_taken), 0) * 20)) as impact_score
      FROM players p
      JOIN teams t ON p.current_team_id = t.team_id
      LEFT JOIN batting_scorecards bs ON p.player_id = bs.player_id
      LEFT JOIN bowling_scorecards bow ON p.player_id = bow.player_id
      LEFT JOIN matches m ON (bs.match_id = m.match_id OR bow.match_id = m.match_id)
      WHERE m.match_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
        AND m.status = 'completed'
        AND p.is_active = true
        AND p.role IN ('All-rounder', 'Batting All-rounder', 'Bowling All-rounder')
      GROUP BY p.player_id, p.player_name, p.role, t.team_name, t.team_code, t.primary_color
      HAVING recent_matches >= 2 AND (total_runs > 0 OR total_wickets > 0)
      ORDER BY impact_score DESC
      LIMIT ?
    `;

      const [trendingAllRounders] = await pool.execute(
         trendingAllRoundersQuery,
         [days, limit]
      );

      return NextResponse.json({
         success: true,
         data: {
            trending_batsmen: trendingBatsmen,
            trending_bowlers: trendingBowlers,
            trending_allrounders: trendingAllRounders,
            period: {
               days,
               from_date: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                  .toISOString()
                  .split("T")[0],
            },
         },
      });
   } catch (error) {
      console.error("Trending players error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch trending players" },
         { status: 500 }
      );
   }
}
