import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const seriesId = searchParams.get("series_id");
      const type = searchParams.get("type") || "performance"; // performance, standings

      let seriesFilter = "";
      if (seriesId) {
         seriesFilter = "WHERE m.series_id = ?";
      }

      if (type === "performance") {
         // Get team performance statistics
         const [teamPerformance] = await pool.execute(
            `
            SELECT 
               t.team_id,
               t.team_name,
               t.team_code,
               t.city,
               t.team_color,
               COUNT(m.match_id) as matches_played,
               SUM(CASE WHEN m.winner_id = t.team_id THEN 1 ELSE 0 END) as matches_won,
               SUM(CASE WHEN m.winner_id != t.team_id AND m.winner_id IS NOT NULL THEN 1 ELSE 0 END) as matches_lost,
               SUM(CASE WHEN m.winner_id IS NULL AND m.is_completed = TRUE THEN 1 ELSE 0 END) as no_results,
               ROUND(
                  (SUM(CASE WHEN m.winner_id = t.team_id THEN 1 ELSE 0 END) * 100.0) / 
                  NULLIF(COUNT(m.match_id), 0), 2
               ) as win_percentage,
               -- Points calculation (2 for win, 1 for no result, 0 for loss)
               (SUM(CASE WHEN m.winner_id = t.team_id THEN 2 ELSE 0 END) + 
                SUM(CASE WHEN m.winner_id IS NULL AND m.is_completed = TRUE THEN 1 ELSE 0 END)) as points
            FROM Teams t
            LEFT JOIN Matches m ON (m.team1_id = t.team_id OR m.team2_id = t.team_id) ${seriesFilter.replace(
               "WHERE",
               "AND"
            )}
            GROUP BY t.team_id, t.team_name, t.team_code, t.city, t.team_color
            ORDER BY points DESC, win_percentage DESC, matches_won DESC
         `,
            seriesId ? [seriesId] : []
         );

         return NextResponse.json({
            success: true,
            data: teamPerformance,
         });
      }

      if (type === "standings") {
         // Get detailed standings with run rate
         const [standings] = await pool.execute(
            `
            SELECT 
               t.team_id,
               t.team_name,
               t.team_code,
               COUNT(m.match_id) as matches_played,
               SUM(CASE WHEN m.winner_id = t.team_id THEN 1 ELSE 0 END) as won,
               SUM(CASE WHEN m.winner_id != t.team_id AND m.winner_id IS NOT NULL THEN 1 ELSE 0 END) as lost,
               SUM(CASE WHEN m.winner_id IS NULL AND m.is_completed = TRUE THEN 1 ELSE 0 END) as no_result,
               (SUM(CASE WHEN m.winner_id = t.team_id THEN 2 ELSE 0 END) + 
                SUM(CASE WHEN m.winner_id IS NULL AND m.is_completed = TRUE THEN 1 ELSE 0 END)) as points,
               ROUND(
                  (SUM(CASE WHEN m.winner_id = t.team_id THEN 1 ELSE 0 END) * 100.0) / 
                  NULLIF(COUNT(m.match_id), 0), 2
               ) as win_percentage,
               -- Net Run Rate calculation (simplified - would need innings data for accurate calculation)
               0.00 as net_run_rate
            FROM Teams t
            LEFT JOIN Matches m ON (m.team1_id = t.team_id OR m.team2_id = t.team_id) ${seriesFilter.replace(
               "WHERE",
               "AND"
            )}
            GROUP BY t.team_id, t.team_name, t.team_code
            ORDER BY points DESC, win_percentage DESC, won DESC
         `,
            seriesId ? [seriesId] : []
         );

         return NextResponse.json({
            success: true,
            data: standings,
         });
      }

      // Get head-to-head records
      const [headToHead] = await pool.execute(
         `
         SELECT 
            t1.team_name as team1,
            t2.team_name as team2,
            COUNT(m.match_id) as total_matches,
            SUM(CASE WHEN m.winner_id = t1.team_id THEN 1 ELSE 0 END) as team1_wins,
            SUM(CASE WHEN m.winner_id = t2.team_id THEN 1 ELSE 0 END) as team2_wins,
            SUM(CASE WHEN m.winner_id IS NULL THEN 1 ELSE 0 END) as draws
         FROM Matches m
         JOIN Teams t1 ON m.team1_id = t1.team_id
         JOIN Teams t2 ON m.team2_id = t2.team_id
         ${seriesFilter}
         GROUP BY t1.team_id, t2.team_id, t1.team_name, t2.team_name
         HAVING total_matches > 0
         ORDER BY total_matches DESC
      `,
         seriesId ? [seriesId] : []
      );

      return NextResponse.json({
         success: true,
         data: { headToHead },
      });
   } catch (error) {
      console.error("Error fetching team statistics:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch team statistics" },
         { status: 500 }
      );
   }
}
