import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";

interface Player extends RowDataPacket {
   player_id: number;
   player_name: string;
   date_of_birth: string;
   nationality: string;
   role: string;
   batting_style: string;
   bowling_style: string;
   is_active: boolean;
   created_at: string;
   updated_at: string;
}

interface PlayerWithTeam extends Player {
   current_team_id: number;
   current_team_name: string;
   current_team_code: string;
   jersey_number: number;
   price_crores: number;
   is_captain: boolean;
   is_vice_captain: boolean;
}

// GET /api/players - Get all players with filters
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const role = searchParams.get("role");
      const nationality = searchParams.get("nationality");
      const team = searchParams.get("team");
      const season = searchParams.get("season");
      const isActive = searchParams.get("active");
      const search = searchParams.get("search");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = (page - 1) * limit;

      let query = `
      SELECT DISTINCT
        p.*,
        pc.team_id as current_team_id,
        t.team_name as current_team_name,
        t.team_code as current_team_code,
        pc.jersey_number,
        pc.price_crores,
        pc.is_captain,
        pc.is_vice_captain,
        s.season_year
      FROM Players p
      LEFT JOIN PlayerContracts pc ON p.player_id = pc.player_id
      LEFT JOIN Teams t ON pc.team_id = t.team_id
      LEFT JOIN Series s ON pc.series_id = s.series_id
    `;

      const conditions: string[] = [];
      const params: any[] = [];

      if (isActive !== null) {
         conditions.push("p.is_active = ?");
         params.push(isActive === "true");
      }

      if (role) {
         conditions.push("p.role = ?");
         params.push(role);
      }

      if (nationality) {
         conditions.push("p.nationality LIKE ?");
         params.push(`%${nationality}%`);
      }

      if (team) {
         conditions.push("(t.team_name LIKE ? OR t.team_code LIKE ?)");
         params.push(`%${team}%`, `%${team}%`);
      }

      if (season) {
         conditions.push("s.season_year = ?");
         params.push(parseInt(season));
      } else {
         // Default to current season if no season specified
         conditions.push("(s.is_completed = false OR s.series_id IS NULL)");
      }

      if (search) {
         conditions.push("p.player_name LIKE ?");
         params.push(`%${search}%`);
      }

      if (conditions.length > 0) {
         query += " WHERE " + conditions.join(" AND ");
      }

      query += " ORDER BY p.player_name LIMIT ? OFFSET ?";
      params.push(limit, offset);

      const [rows] = await pool.execute<PlayerWithTeam[]>(query, params);

      // Get total count for pagination
      let countQuery = `
      SELECT COUNT(DISTINCT p.player_id) as total
      FROM Players p
      LEFT JOIN PlayerContracts pc ON p.player_id = pc.player_id
      LEFT JOIN Teams t ON pc.team_id = t.team_id
      LEFT JOIN Series s ON pc.series_id = s.series_id
    `;

      if (conditions.length > 0) {
         // Remove LIMIT and OFFSET from conditions for count
         const countConditions = conditions.slice(0, -2);
         if (countConditions.length > 0) {
            countQuery += " WHERE " + countConditions.join(" AND ");
         }
      }

      const [countResult] = await pool.execute<RowDataPacket[]>(
         countQuery,
         params.slice(0, -2) // Remove limit and offset params
      );

      const totalPlayers = countResult[0].total;
      const totalPages = Math.ceil(totalPlayers / limit);

      return NextResponse.json({
         success: true,
         data: rows,
         pagination: {
            currentPage: page,
            totalPages,
            totalPlayers,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
         },
      });
   } catch (error) {
      console.error("Error fetching players:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch players" },
         { status: 500 }
      );
   }
}

// POST /api/players - Create new player (admin only)
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         player_name,
         date_of_birth,
         nationality,
         role,
         batting_style,
         bowling_style,
      } = body;

      // Validate required fields
      if (!player_name || !role) {
         return NextResponse.json(
            {
               success: false,
               error: "Missing required fields: player_name, role",
            },
            { status: 400 }
         );
      }

      // Validate role enum
      const validRoles = ["Batsman", "Bowler", "All-rounder", "Wicket-keeper"];
      if (!validRoles.includes(role)) {
         return NextResponse.json(
            {
               success: false,
               error: "Invalid role. Must be one of: " + validRoles.join(", "),
            },
            { status: 400 }
         );
      }

      // Validate batting style if provided
      if (
         batting_style &&
         !["Right-handed", "Left-handed"].includes(batting_style)
      ) {
         return NextResponse.json(
            {
               success: false,
               error: "Invalid batting style. Must be 'Right-handed' or 'Left-handed'",
            },
            { status: 400 }
         );
      }

      const query = `
      INSERT INTO Players (
        player_name, date_of_birth, nationality, role, batting_style, bowling_style
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

      const [result] = await pool.execute<ResultSetHeader>(query, [
         player_name,
         date_of_birth || null,
         nationality || null,
         role,
         batting_style || null,
         bowling_style || null,
      ]);

      // Fetch the created player
      const [createdPlayer] = await pool.execute<Player[]>(
         "SELECT * FROM Players WHERE player_id = ?",
         [result.insertId]
      );

      return NextResponse.json(
         {
            success: true,
            data: createdPlayer[0],
            message: "Player created successfully",
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
