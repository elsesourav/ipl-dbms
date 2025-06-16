import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const teamId = params.id;

      // Get current season stats (latest series)
      const [statsRows] = await pool.execute(
         `SELECT 
        ts.matches_played,
        ts.matches_won,
        ts.matches_lost,
        ts.no_results,
        ts.points,
        ts.net_run_rate
      FROM TeamStats ts
      JOIN Series s ON ts.series_id = s.series_id
      WHERE ts.team_id = ?
      ORDER BY s.season_year DESC
      LIMIT 1`,
         [teamId]
      );

      if (Array.isArray(statsRows) && statsRows.length === 0) {
         // Return default stats if none found
         return NextResponse.json({
            matches_played: 0,
            matches_won: 0,
            matches_lost: 0,
            no_results: 0,
            points: 0,
            net_run_rate: 0.0,
         });
      }

      return NextResponse.json(statsRows[0]);
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
