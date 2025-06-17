import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/series - Get all IPL seasons
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const year = searchParams.get("year");
      const completed = searchParams.get("completed");
      const current = searchParams.get("current");

      let query = `
      SELECT 
        s.series_id,
        s.series_name,
        s.season_year,
        s.start_date,
        s.end_date,
        s.format,
        s.authority,
        s.num_teams,
        s.total_matches,
        s.is_completed,
        s.created_at,
        COUNT(DISTINCT m.match_id) as matches_played,
        COUNT(DISTINCT CASE WHEN m.is_completed = TRUE THEN m.match_id END) as matches_completed,
        COUNT(DISTINCT pc.player_id) as total_players
      FROM Series s
      LEFT JOIN Matches m ON s.series_id = m.series_id
      LEFT JOIN PlayerContracts pc ON s.series_id = pc.series_id
      WHERE 1=1
    `;

      const params: any[] = [];

      if (year) {
         query += " AND s.season_year = ?";
         params.push(parseInt(year));
      }

      if (completed === "true") {
         query += " AND s.is_completed = TRUE";
      } else if (completed === "false") {
         query += " AND s.is_completed = FALSE";
      }

      if (current === "true") {
         query +=
            " AND s.start_date <= CURDATE() AND (s.end_date >= CURDATE() OR s.end_date IS NULL)";
      }

      query += `
      GROUP BY s.series_id, s.series_name, s.season_year, s.start_date, s.end_date, 
               s.format, s.authority, s.num_teams, s.total_matches, s.is_completed, s.created_at
      ORDER BY s.season_year DESC
    `;

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
            error: "Failed to fetch series data",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// POST /api/series - Create new season (admin only)
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         series_name,
         season_year,
         start_date,
         end_date,
         format = "T20",
         authority = "BCCI",
         num_teams = 10,
         total_matches,
      } = body;

      // Validate required fields
      if (!series_name || !season_year) {
         return NextResponse.json(
            {
               success: false,
               error: "Missing required fields: series_name, season_year",
            },
            { status: 400 }
         );
      }

      // Check if series already exists for this year
      const existingQuery = `
      SELECT series_id FROM Series WHERE season_year = ?
    `;
      const [existing] = await pool.execute<RowDataPacket[]>(existingQuery, [
         season_year,
      ]);

      if (existing.length > 0) {
         return NextResponse.json(
            {
               success: false,
               error: "Series already exists for this year",
            },
            { status: 409 }
         );
      }

      // Insert new series
      const insertQuery = `
      INSERT INTO Series 
      (series_name, season_year, start_date, end_date, format, authority, num_teams, total_matches)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const [result] = await pool.execute(insertQuery, [
         series_name,
         season_year,
         start_date || null,
         end_date || null,
         format,
         authority,
         num_teams,
         total_matches || null,
      ]);

      const insertResult = result as any;

      // Fetch the created series
      const selectQuery = `
      SELECT 
        series_id,
        series_name,
        season_year,
        start_date,
        end_date,
        format,
        authority,
        num_teams,
        total_matches,
        is_completed,
        created_at
      FROM Series
      WHERE series_id = ?
    `;

      const [newRecord] = await pool.execute<RowDataPacket[]>(selectQuery, [
         insertResult.insertId,
      ]);

      return NextResponse.json(
         {
            success: true,
            message: "Series created successfully",
            data: newRecord[0],
         },
         { status: 201 }
      );
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to create series",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
