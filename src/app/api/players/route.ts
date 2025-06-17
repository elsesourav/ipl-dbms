import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET() {
   try {
      const [rows] = await db.execute(`
      SELECT 
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
        t.team_code
      FROM Players p
      LEFT JOIN Teams t ON p.team_id = t.team_id
      WHERE p.is_active = TRUE
      ORDER BY p.player_name
    `);

      return NextResponse.json({ success: true, data: rows });
   } catch (error) {
      console.error("Error fetching players:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch players" },
         { status: 500 }
      );
   }
}

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         name,
         team,
         role,
         batting_style,
         bowling_style,
         nationality,
         age,
         matches_played,
      } = body;

      // First, get the team_id from team name
      let team_id = null;
      if (team) {
         const [teamRows] = await db.execute(
            "SELECT team_id FROM Teams WHERE team_name = ?",
            [team]
         );
         if ((teamRows as any[]).length > 0) {
            team_id = (teamRows as any[])[0].team_id;
         }
      }

      // Calculate birth year from age if provided
      let date_of_birth = null;
      if (age) {
         const currentYear = new Date().getFullYear();
         const birthYear = currentYear - age;
         date_of_birth = `${birthYear}-01-01`; // Default to Jan 1st
      }

      const [result] = await db.execute(
         `INSERT INTO Players 
       (player_name, date_of_birth, nationality, role, batting_style, bowling_style, team_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
         [
            name,
            date_of_birth,
            nationality || "Indian",
            role,
            batting_style,
            bowling_style,
            team_id,
         ]
      );

      return NextResponse.json(
         {
            success: true,
            message: "Player created successfully",
            player_id: (result as any).insertId,
         },
         { status: 201 }
      );
   } catch (error) {
      console.error("Error creating player:", error);
      return NextResponse.json(
         { success: false, error: "Failed to create player" },
         { status: 500 }
      );
   }
}
