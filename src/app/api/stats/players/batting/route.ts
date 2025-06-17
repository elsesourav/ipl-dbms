import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../../lib/db";

// GET /api/stats/players/batting - Get batting statistics leaderboard
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const limit = parseInt(searchParams.get("limit") || "50");
      const sortBy = searchParams.get("sort_by") || "total_runs"; // total_runs, avg_runs, strike_rate
      const minMatches = parseInt(searchParams.get("min_matches") || "3");

      let whereClause = 'm.status = "completed"';
      let queryParams: any[] = [];

      if (season) {
         whereClause += " AND se.season = ?";
         queryParams.push(season);
      }

      // Determine sort order
      let orderBy = "total_runs DESC";
      switch (sortBy) {
         case "avg_runs":
            orderBy = "batting_average DESC, total_runs DESC";
            break;
         case "strike_rate":
            orderBy = "strike_rate DESC, total_runs DESC";
            break;
         case "highest_score":
            orderBy = "highest_score DESC, total_runs DESC";
            break;
         case "most_sixes":
            orderBy = "total_sixes DESC, total_runs DESC";
            break;
         case "most_fours":
            orderBy = "total_fours DESC, total_runs DESC";
            break;
         default:
            orderBy = "total_runs DESC";
      }

      const battingStatsQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        p.batting_style,
        t.team_name,
        t.team_code,
        t.primary_color,
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
        END as batting_average,
        RANK() OVER (ORDER BY ${orderBy}) as ranking
      FROM batting_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON bs.match_id = m.match_id
      JOIN series se ON m.series_id = se.series_id
      WHERE ${whereClause}
        AND p.is_active = true
      GROUP BY p.player_id, p.player_name, p.role, p.batting_style, t.team_name, t.team_code, t.primary_color
      HAVING matches_played >= ? AND total_runs > 0
      ORDER BY ${orderBy}
      LIMIT ?
    `;

      queryParams.push(minMatches, limit);
      const [battingStats] = await pool.execute(battingStatsQuery, queryParams);

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
        COUNT(DISTINCT p.player_id) as total_batsmen,
        AVG(subq.total_runs) as avg_runs_per_batsman,
        MAX(subq.total_runs) as highest_total_runs,
        SUM(subq.total_runs) as tournament_total_runs
      FROM (
        SELECT 
          p.player_id,
          SUM(bs.runs_scored) as total_runs
        FROM batting_scorecards bs
        JOIN players p ON bs.player_id = p.player_id
        JOIN matches m ON bs.match_id = m.match_id
        JOIN series se ON m.series_id = se.series_id
        WHERE ${whereClause}
        GROUP BY p.player_id
        HAVING SUM(bs.runs_scored) > 0
      ) subq
    `;

      const summaryParams = queryParams.slice(0, -2); // Remove min_matches and limit
      const [summary] = await pool.execute(summaryQuery, summaryParams);

      return NextResponse.json({
         success: true,
         data: {
            season: seasonInfo,
            batting_stats: battingStats,
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
      console.error("Batting stats error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch batting statistics" },
         { status: 500 }
      );
   }
}
