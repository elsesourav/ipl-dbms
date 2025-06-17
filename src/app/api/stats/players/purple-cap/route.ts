import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/stats/players/purple-cap - Get purple cap holders
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const limit = parseInt(searchParams.get("limit") || "20");

      let whereClause = 'm.status = "completed" AND bs.overs_bowled > 0';
      let queryParams: any[] = [];

      if (season) {
         whereClause += " AND se.season = ?";
         queryParams.push(season);
      }

      const purpleCapQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        p.bowling_style,
        t.team_name,
        t.team_code,
        t.primary_color,
        COUNT(DISTINCT bs.match_id) as matches_played,
        SUM(bs.wickets_taken) as total_wickets,
        AVG(bs.wickets_taken) as avg_wickets,
        MAX(bs.wickets_taken) as best_bowling_figures,
        SUM(bs.overs_bowled) as total_overs,
        SUM(bs.runs_conceded) as total_runs_conceded,
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
        END as bowling_strike_rate,
        se.season
      FROM bowling_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON bs.match_id = m.match_id
      JOIN series se ON m.series_id = se.series_id
      WHERE ${whereClause}
        AND p.is_active = true
      GROUP BY p.player_id, p.player_name, p.role, p.bowling_style, t.team_name, t.team_code, t.primary_color, se.season
      HAVING total_wickets > 0
      ORDER BY total_wickets DESC, economy_rate ASC
      LIMIT ?
    `;

      queryParams.push(limit);
      const [purpleCapData] = await pool.execute(purpleCapQuery, queryParams);

      // Get current leader info
      const currentLeader = (purpleCapData as any[])[0] || null;

      // Get season info
      const seasonQuery = season
         ? "SELECT season, series_name FROM series WHERE season = ? LIMIT 1"
         : "SELECT season, series_name FROM series WHERE is_active = true LIMIT 1";

      const seasonParams = season ? [season] : [];
      const [seasonInfo] = await pool.execute(seasonQuery, seasonParams);

      return NextResponse.json({
         success: true,
         data: {
            season: (seasonInfo as any[])[0] || null,
            current_leader: currentLeader,
            leaderboard: purpleCapData,
            last_updated: new Date().toISOString(),
         },
      });
   } catch (error) {
      console.error("Purple Cap leaderboard error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch Purple Cap leaderboard" },
         { status: 500 }
      );
   }
}
