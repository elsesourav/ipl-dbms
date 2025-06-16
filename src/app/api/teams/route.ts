import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET() {
   try {
      const [rows] = await db.execute(`
      SELECT 
        t.team_id,
        t.team_name as name,
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
      ORDER BY t.team_name
    `);

      return NextResponse.json({ success: true, data: rows });
   } catch (error) {
      console.error("Error fetching teams:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch teams" },
         { status: 500 }
      );
   }
}

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { name, city, captain, owner, home_ground, coach } = body;

      // Generate team code from name (first 3 letters)
      const team_code = name ? name.substring(0, 3).toUpperCase() : "";

      const [result] = await db.execute(
         `INSERT INTO Teams (team_name, team_code, city, founded_year, owner, coach, home_ground) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
         [
            name,
            team_code,
            city,
            new Date().getFullYear(), // Default founded year
            owner,
            coach,
            home_ground,
         ]
      );

      return NextResponse.json(
         {
            success: true,
            message: "Team created successfully",
            team_id: (result as any).insertId,
         },
         { status: 201 }
      );
   } catch (error) {
      console.error("Error creating team:", error);
      return NextResponse.json(
         { success: false, error: "Failed to create team" },
         { status: 500 }
      );
   }
}
