import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/dashboard/recent-matches - Get recent match results
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "10");
      const offset = parseInt(searchParams.get("offset") || "0");

      const recentMatchesQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.match_time,
        m.status,
        m.result,
        m.match_type,
        m.overs,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t1.primary_color as team1_color,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        t2.primary_color as team2_color,
        s.stadium_name,
        s.city,
        se.season,
        se.series_name,
        CASE 
          WHEN m.result LIKE '%won by%' THEN 
            CASE 
              WHEN m.result LIKE CONCAT(t1.team_name, '%') THEN t1.team_name
              WHEN m.result LIKE CONCAT(t2.team_name, '%') THEN t2.team_name
              ELSE NULL
            END
          ELSE NULL
        END as winner_name,
        (SELECT SUM(runs_scored) FROM batting_scorecards WHERE match_id = m.match_id AND team_id = m.team1_id) as team1_total_runs,
        (SELECT SUM(runs_scored) FROM batting_scorecards WHERE match_id = m.match_id AND team_id = m.team2_id) as team2_total_runs,
        (SELECT COUNT(wickets_taken) FROM bowling_scorecards WHERE match_id = m.match_id AND bowling_team_id != m.team1_id) as team1_wickets,
        (SELECT COUNT(wickets_taken) FROM bowling_scorecards WHERE match_id = m.match_id AND bowling_team_id != m.team2_id) as team2_wickets
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      JOIN series se ON m.series_id = se.series_id
      WHERE m.status IN ('completed', 'live', 'abandoned')
      ORDER BY m.match_date DESC, m.match_time DESC
      LIMIT ? OFFSET ?
    `;

      const [matches] = await pool.execute(recentMatchesQuery, [limit, offset]);

      // Get total count for pagination
      const countQuery = `
      SELECT COUNT(*) as total 
      FROM matches 
      WHERE status IN ('completed', 'live', 'abandoned')
    `;

      const [countResult] = await pool.execute(countQuery);
      const total = (countResult as any)[0].total;

      return NextResponse.json({
         success: true,
         data: {
            matches,
            pagination: {
               total,
               limit,
               offset,
               hasMore: offset + limit < total,
            },
         },
      });
   } catch (error) {
      console.error("Recent matches error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch recent matches" },
         { status: 500 }
      );
   }
}
