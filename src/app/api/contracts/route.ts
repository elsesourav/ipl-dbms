import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";

// GET /api/contracts - Get all player contracts
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const teamId = searchParams.get("teamId");
      const playerId = searchParams.get("playerId");
      const contractType = searchParams.get("contractType");
      const captainsOnly = searchParams.get("captainsOnly");

      let query = `
      SELECT 
        pc.contract_id,
        pc.player_id,
        p.player_name,
        p.role,
        p.nationality,
        p.batting_style,
        p.bowling_style,
        pc.team_id,
        t.team_name,
        t.team_code,
        t.team_color,
        pc.series_id,
        s.season_year,
        s.series_name,
        pc.jersey_number,
        pc.price_crores,
        pc.contract_type,
        pc.is_captain,
        pc.is_vice_captain,
        pc.created_at,
        pc.updated_at
      FROM PlayerContracts pc
      JOIN Players p ON pc.player_id = p.player_id
      JOIN Teams t ON pc.team_id = t.team_id
      JOIN Series s ON pc.series_id = s.series_id
      WHERE p.is_active = TRUE AND t.is_active = TRUE
    `;

      const params: any[] = [];

      if (season) {
         query += " AND s.season_year = ?";
         params.push(parseInt(season));
      }

      if (teamId) {
         query += " AND pc.team_id = ?";
         params.push(parseInt(teamId));
      }

      if (playerId) {
         query += " AND pc.player_id = ?";
         params.push(parseInt(playerId));
      }

      if (contractType) {
         query += " AND pc.contract_type = ?";
         params.push(contractType);
      }

      if (captainsOnly === "true") {
         query += " AND (pc.is_captain = TRUE OR pc.is_vice_captain = TRUE)";
      }

      query +=
         " ORDER BY s.season_year DESC, pc.price_crores DESC, p.player_name";

      const [rows] = await pool.execute<RowDataPacket[]>(query, params);

      return NextResponse.json({
         success: true,
         data: rows,
         count: rows.length,
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch contracts",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// POST /api/contracts - Create player contract (admin only)
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         player_id,
         team_id,
         series_id,
         jersey_number,
         price_crores,
         contract_type,
         is_captain = false,
         is_vice_captain = false,
      } = body;

      // Validate required fields
      if (!player_id || !team_id || !series_id) {
         return NextResponse.json(
            {
               success: false,
               error: "Missing required fields: player_id, team_id, series_id",
            },
            { status: 400 }
         );
      }

      // Check if contract already exists for this player in this season
      const existingQuery = `
      SELECT contract_id FROM PlayerContracts 
      WHERE player_id = ? AND series_id = ?
    `;
      const [existing] = await pool.execute<RowDataPacket[]>(existingQuery, [
         player_id,
         series_id,
      ]);

      if (existing.length > 0) {
         return NextResponse.json(
            {
               success: false,
               error: "Player already has a contract for this season",
            },
            { status: 409 }
         );
      }

      // If setting as captain, remove captain status from other players in same team/season
      if (is_captain) {
         await pool.execute(
            "UPDATE PlayerContracts SET is_captain = FALSE WHERE team_id = ? AND series_id = ?",
            [team_id, series_id]
         );
      }

      // Insert new contract
      const insertQuery = `
      INSERT INTO PlayerContracts 
      (player_id, team_id, series_id, jersey_number, price_crores, contract_type, is_captain, is_vice_captain)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const [result] = await pool.execute(insertQuery, [
         player_id,
         team_id,
         series_id,
         jersey_number || null,
         price_crores || null,
         contract_type || "auction",
         is_captain,
         is_vice_captain,
      ]);

      const insertResult = result as any;

      // Fetch the created contract
      const selectQuery = `
      SELECT 
        pc.contract_id,
        pc.player_id,
        p.player_name,
        pc.team_id,
        t.team_name,
        pc.series_id,
        s.season_year,
        pc.jersey_number,
        pc.price_crores,
        pc.contract_type,
        pc.is_captain,
        pc.is_vice_captain
      FROM PlayerContracts pc
      JOIN Players p ON pc.player_id = p.player_id
      JOIN Teams t ON pc.team_id = t.team_id
      JOIN Series s ON pc.series_id = s.series_id
      WHERE pc.contract_id = ?
    `;

      const [newRecord] = await pool.execute<RowDataPacket[]>(selectQuery, [
         insertResult.insertId,
      ]);

      return NextResponse.json(
         {
            success: true,
            message: "Contract created successfully",
            data: newRecord[0],
         },
         { status: 201 }
      );
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to create contract",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
