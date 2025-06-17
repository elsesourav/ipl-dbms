import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";

// GET /api/points-table/[season] - Get points table for specific season ID
export async function GET(
   request: NextRequest,
   { params }: { params: { season: string } }
) {
   try {
      const season = params.season;

      // Verify season exists
      const seasonQuery = `
      SELECT season, series_name, start_date, end_date
      FROM series 
      WHERE season = ?
    `;

      const [seasonInfo] = await pool.execute(seasonQuery, [season]);

      if ((seasonInfo as any[]).length === 0) {
         return NextResponse.json(
            { success: false, error: "Season not found" },
            { status: 404 }
         );
      }

      // Get points table
      const pointsTableQuery = `
      SELECT 
        ts.team_id,
        t.team_name,
        t.team_code,
        t.primary_color,
        ts.matches_played,
        ts.matches_won,
        ts.matches_lost,
        ts.matches_tied,
        ts.matches_no_result,
        ts.points,
        ts.net_run_rate,
        ts.runs_for,
        ts.runs_against,
        ts.overs_for,
        ts.overs_against,
        RANK() OVER (ORDER BY ts.points DESC, ts.net_run_rate DESC) as position
      FROM team_stats ts
      JOIN teams t ON ts.team_id = t.team_id
      WHERE ts.season = ?
      ORDER BY ts.points DESC, ts.net_run_rate DESC
    `;

      const [pointsTable] = await pool.execute(pointsTableQuery, [season]);

      return NextResponse.json({
         success: true,
         data: {
            season: (seasonInfo as any[])[0],
            points_table: pointsTable,
            last_updated: new Date().toISOString(),
         },
      });
   } catch (error) {
      console.error("Points table error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch points table" },
         { status: 500 }
      );
   }
}
