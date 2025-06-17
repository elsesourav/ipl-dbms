import pool from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

interface Team extends RowDataPacket {
   team_id: number;
   team_name: string;
   team_code: string;
   city: string;
   founded_year: number;
   owner: string;
   coach: string;
   home_ground: string;
   team_color: string;
   is_active: boolean;
   created_at: string;
   updated_at: string;
}

// GET /api/teams - Get all teams with optional filters
export async function GET(request: NextRequest) {
   try {
      console.log("🔍 Teams route called");
      const { searchParams } = new URL(request.url);
      const isActive = searchParams.get("active");
      const city = searchParams.get("city");
      const season = searchParams.get("season");

      let query = `
      SELECT DISTINCT t.*, 
        CASE WHEN pc.team_id IS NOT NULL THEN true ELSE false END as has_current_players
      FROM Teams t
      LEFT JOIN PlayerContracts pc ON t.team_id = pc.team_id
    `;

      const conditions: string[] = [];
      const params: any[] = [];

      if (isActive !== null) {
         conditions.push("t.is_active = ?");
         params.push(isActive === "true");
      }

      if (city) {
         conditions.push("t.city LIKE ?");
         params.push(`%${city}%`);
      }

      if (season) {
         conditions.push(
            "pc.series_id = (SELECT series_id FROM Series WHERE season_year = ?)"
         );
         params.push(parseInt(season));
      }

      if (conditions.length > 0) {
         query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY t.team_name";

      const [rows] = await pool.execute<Team[]>(query, params);

      return NextResponse.json({
         success: true,
         data: rows,
         count: rows.length,
      });
   } catch (error) {
      console.error("Error fetching teams:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch teams" },
         { status: 500 }
      );
   }
}

// POST /api/teams - Create new team (admin only)
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         team_name,
         team_code,
         city,
         founded_year,
         owner,
         coach,
         home_ground,
         team_color,
      } = body;

      // Validate required fields
      if (!team_name || !team_code || !city) {
         return NextResponse.json(
            {
               success: false,
               error: "Missing required fields: team_name, team_code, city",
            },
            { status: 400 }
         );
      }

      const query = `
      INSERT INTO Teams (
        team_name, team_code, city, founded_year, owner, coach, home_ground, team_color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const [result] = await pool.execute<ResultSetHeader>(query, [
         team_name,
         team_code,
         city,
         founded_year || null,
         owner || null,
         coach || null,
         home_ground || null,
         team_color || null,
      ]);

      // Fetch the created team
      const [createdTeam] = await pool.execute<Team[]>(
         "SELECT * FROM Teams WHERE team_id = ?",
         [result.insertId]
      );

      return NextResponse.json(
         {
            success: true,
            data: createdTeam[0],
            message: "Team created successfully",
         },
         { status: 201 }
      );
   } catch (error: any) {
      console.error("Error creating team:", error);

      if (error.code === "ER_DUP_ENTRY") {
         return NextResponse.json(
            { success: false, error: "Team code already exists" },
            { status: 409 }
         );
      }

      return NextResponse.json(
         { success: false, error: "Failed to create team" },
         { status: 500 }
      );
   }
}
