import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../../lib/db";

// GET /api/stats/players/bowling - Get bowling statistics leaderboard
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const limit = parseInt(searchParams.get("limit") || "50");
      const sortBy = searchParams.get("sort_by") || "total_wickets"; // total_wickets, economy_rate, bowling_average
      const minMatches = parseInt(searchParams.get("min_matches") || "3");

      let whereClause = 'm.status = "completed" AND bs.overs_bowled > 0';
      let queryParams: any[] = [];

      if (season) {
         whereClause += " AND se.season = ?";
         queryParams.push(season);
      }

      // Determine sort order
      let orderBy = "total_wickets DESC";
      switch (sortBy) {
         case "economy_rate":
            orderBy = "economy_rate ASC, total_wickets DESC";
            break;
         case "bowling_average":
            orderBy = "bowling_average ASC, total_wickets DESC";
            break;
         case "bowling_strike_rate":
            orderBy = "bowling_strike_rate ASC, total_wickets DESC";
            break;
         case "best_bowling":
            orderBy = "best_bowling_figures DESC, total_wickets DESC";
            break;
         default:
            orderBy = "total_wickets DESC, economy_rate ASC";
      }

      const bowlingStatsQuery = `
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
        RANK() OVER (ORDER BY ${orderBy}) as ranking
      FROM bowling_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON bs.match_id = m.match_id
      JOIN series se ON m.series_id = se.series_id
      WHERE ${whereClause}
        AND p.is_active = true
      GROUP BY p.player_id, p.player_name, p.role, p.bowling_style, t.team_name, t.team_code, t.primary_color
      HAVING matches_played >= ? AND total_overs > 0
      ORDER BY ${orderBy}
      LIMIT ?
    `;

      queryParams.push(minMatches, limit);
      const [bowlingStats] = await pool.execute(bowlingStatsQuery, queryParams);

      // Get season info if specified
      let seasonInfo = null;
      if (season) {
         const seasonQuery =
            "SELECT season, series_name FROM series WHERE season = ? LIMIT 1";
         const [seasonResult] = await pool.execute(seasonQuery, [season]);
         seasonInfo = (seasonResult as any[])[0] || null;
      }

      // Get summary statistics
      const summaryQuery = `
      SELECT 
        COUNT(DISTINCT p.player_id) as total_bowlers,
        SUM(subq.total_wickets) as tournament_total_wickets,
        AVG(subq.total_wickets) as avg_wickets_per_bowler,
        MAX(subq.total_wickets) as highest_wicket_taker,
        AVG(subq.economy_rate) as avg_economy_rate
      FROM (
        SELECT 
          p.player_id,
          SUM(bs.wickets_taken) as total_wickets,
          AVG(CASE WHEN bs.overs_bowled > 0 THEN bs.runs_conceded / bs.overs_bowled ELSE 0 END) as economy_rate
        FROM bowling_scorecards bs
        JOIN players p ON bs.player_id = p.player_id
        JOIN matches m ON bs.match_id = m.match_id
        JOIN series se ON m.series_id = se.series_id
        WHERE ${whereClause}
        GROUP BY p.player_id
        HAVING SUM(bs.overs_bowled) > 0
      ) subq
    `;

      const summaryParams = queryParams.slice(0, -2); // Remove min_matches and limit
      const [summary] = await pool.execute(summaryQuery, summaryParams);

      return NextResponse.json({
         success: true,
         data: {
            season: seasonInfo,
            bowling_stats: bowlingStats,
            summary: (summary as any[])[0],
            filters: {
               season,
               sort_by: sortBy,
               min_matches: minMatches,
            },
            last_updated: new Date().toISOString(),
         },
      });
   } catch (error) {
      console.error("Bowling stats error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch bowling statistics" },
         { status: 500 }
      );
   }
}
