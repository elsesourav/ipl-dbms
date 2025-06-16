import pool from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
   try {

      const [rows] = await pool.execute(`
      SELECT 
        s.*,
        COUNT(m.match_id) as matches_played,
        AVG(CASE WHEN m.winner_id IS NOT NULL THEN 1 ELSE 0 END) as completion_rate
      FROM Stadiums s
      LEFT JOIN Matches m ON s.stadium_id = m.stadium_id
      GROUP BY s.stadium_id
      ORDER BY matches_played DESC, s.stadium_name
    `);

      console.log("Stadiums fetched successfully");
      console.log(rows);

      return NextResponse.json({
         stadiums: rows,
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
