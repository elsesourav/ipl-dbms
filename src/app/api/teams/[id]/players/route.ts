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
        player_id,
        player_name,
        role,
        nationality,
        jersey_number,
        price_crores,
        batting_style,
        bowling_style
      FROM Players 
      WHERE team_id = ? AND is_active = TRUE
      ORDER BY 
        CASE role 
          WHEN 'Wicket-keeper' THEN 1
          WHEN 'Batsman' THEN 2
          WHEN 'All-rounder' THEN 3
          WHEN 'Bowler' THEN 4
          ELSE 5
        END,
        player_name`,
         [teamId]
      );

      return NextResponse.json(rows);
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
