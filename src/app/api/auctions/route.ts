import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/auctions - Get all auction data
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const playerId = searchParams.get("playerId");
      const teamId = searchParams.get("teamId");
      const auctionType = searchParams.get("auctionType");

      let query = `
      SELECT 
        pah.auction_id,
        pah.player_id,
        p.player_name,
        p.role,
        p.nationality,
        pah.team_id,
        t.team_name,
        t.team_code,
        pah.series_id,
        s.season_year,
        s.series_name,
        pah.auction_type,
        pah.base_price_crores,
        pah.sold_price_crores,
        pah.auction_date,
        pah.created_at
      FROM PlayerAuctionHistory pah
      JOIN Players p ON pah.player_id = p.player_id
      LEFT JOIN Teams t ON pah.team_id = t.team_id
      JOIN Series s ON pah.series_id = s.series_id
      WHERE 1=1
    `;

      const params: any[] = [];

      if (season) {
         query += " AND s.season_year = ?";
         params.push(parseInt(season));
      }

      if (playerId) {
         query += " AND pah.player_id = ?";
         params.push(parseInt(playerId));
      }

      if (teamId) {
         query += " AND pah.team_id = ?";
         params.push(parseInt(teamId));
      }

      if (auctionType) {
         query += " AND pah.auction_type = ?";
         params.push(auctionType);
      }

      query += " ORDER BY pah.auction_date DESC, pah.sold_price_crores DESC";

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
            error: "Failed to fetch auction data",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// POST /api/auctions - Add new auction record
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         player_id,
         team_id,
         series_id,
         auction_type,
         base_price_crores,
         sold_price_crores,
         auction_date,
      } = body;

      // Validate required fields
      if (!player_id || !series_id || !auction_type) {
         return NextResponse.json(
            {
               success: false,
               error: "Missing required fields: player_id, series_id, auction_type",
            },
            { status: 400 }
         );
      }

      // Insert auction record
      const insertQuery = `
      INSERT INTO PlayerAuctionHistory 
      (player_id, team_id, series_id, auction_type, base_price_crores, sold_price_crores, auction_date)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

      const [result] = await pool.execute(insertQuery, [
         player_id,
         team_id,
         series_id,
         auction_type,
         base_price_crores || null,
         sold_price_crores || null,
         auction_date || new Date().toISOString().split("T")[0],
      ]);

      const insertResult = result as any;

      // Fetch the created auction record
      const selectQuery = `
      SELECT 
        pah.auction_id,
        pah.player_id,
        p.player_name,
        pah.team_id,
        t.team_name,
        pah.series_id,
        s.season_year,
        pah.auction_type,
        pah.base_price_crores,
        pah.sold_price_crores,
        pah.auction_date
      FROM PlayerAuctionHistory pah
      JOIN Players p ON pah.player_id = p.player_id
      LEFT JOIN Teams t ON pah.team_id = t.team_id
      JOIN Series s ON pah.series_id = s.series_id
      WHERE pah.auction_id = ?
    `;

      const [newRecord] = await pool.execute<RowDataPacket[]>(selectQuery, [
         insertResult.insertId,
      ]);

      return NextResponse.json(
         {
            success: true,
            message: "Auction record created successfully",
            data: newRecord[0],
         },
         { status: 201 }
      );
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to create auction record",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
