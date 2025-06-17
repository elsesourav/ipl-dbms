import pool from "@/lib/db";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

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
      console.log("Players API called");

      // Start with a very simple query without parameters
      const query = "SELECT * FROM Players ORDER BY player_name LIMIT 20";

      console.log("Executing simple query:", query);

      const [rows] = await pool.execute(query);
      console.log(
         "Query executed successfully, found rows:",
         Array.isArray(rows) ? rows.length : "not array"
      );

      // Simple count query
      const [countResult] = await pool.execute(
         "SELECT COUNT(*) as total FROM Players"
      );
      const totalPlayers = (countResult as RowDataPacket[])[0].total;

      return NextResponse.json({
         success: true,
         data: rows,
         count: Array.isArray(rows) ? rows.length : 0,
         total: totalPlayers,
      });
   } catch (error) {
      console.error("Error fetching players:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch players",
            details: error.message,
         },
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
