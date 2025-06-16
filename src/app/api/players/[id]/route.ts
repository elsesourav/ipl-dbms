import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const playerId = params.id;

      const [rows] = await pool.execute(
         `SELECT 
        p.player_id,
        p.player_name,
        p.date_of_birth,
        p.nationality,
        p.role,
        p.batting_style,
        p.bowling_style,
        p.jersey_number,
        p.price_crores,
        t.team_name,
        t.team_code,
        t.team_color
      FROM Players p
      LEFT JOIN Teams t ON p.team_id = t.team_id
      WHERE p.player_id = ?`,
         [playerId]
      );

      if (Array.isArray(rows) && rows.length === 0) {
         return NextResponse.json(
            { error: "Player not found" },
            { status: 404 }
         );
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
