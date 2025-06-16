import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const teamId = params.id;

      const [rows] = await pool.execute(
         `SELECT 
        t.team_id,
        t.team_name,
        t.team_code,
        t.city,
        t.founded_year,
        t.owner,
        t.coach,
        t.home_ground,
        t.team_color,
        p.player_name as captain_name
      FROM Teams t
      LEFT JOIN Players p ON t.captain_id = p.player_id
      WHERE t.team_id = ?`,
         [teamId]
      );

      if (Array.isArray(rows) && rows.length === 0) {
         return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      return NextResponse.json(rows[0]);
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
