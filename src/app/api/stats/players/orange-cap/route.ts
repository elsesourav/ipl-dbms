import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/stats/players/orange-cap - Get orange cap holders
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const limit = parseInt(searchParams.get("limit") || "20");

      let whereClause = 'm.status = "completed"';
      let queryParams: any[] = [];

      if (season) {
         whereClause += " AND se.season = ?";
         queryParams.push(season);
      }

      const orangeCapQuery = `
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
        se.season
      FROM batting_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON bs.match_id = m.match_id
      JOIN series se ON m.series_id = se.series_id
      WHERE ${whereClause}
        AND p.is_active = true
      GROUP BY p.player_id, p.player_name, p.role, p.batting_style, t.team_name, t.team_code, t.primary_color, se.season
      HAVING total_runs > 0
      ORDER BY total_runs DESC, batting_average DESC
      LIMIT ?
    `;

      queryParams.push(limit);
      const [orangeCapData] = await pool.execute(orangeCapQuery, queryParams);

      // Get current leader info
      const currentLeader = (orangeCapData as any[])[0] || null;

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
            leaderboard: orangeCapData,
            last_updated: new Date().toISOString(),
         },
      });
   } catch (error) {
      console.error("Orange Cap leaderboard error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch Orange Cap leaderboard" },
         { status: 500 }
      );
   }
}
