import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";

// GET /api/tournaments - Get all tournaments/seasons
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const year = searchParams.get("year");
      const status = searchParams.get("status"); // 'upcoming', 'ongoing', 'completed'

      let query = `
      SELECT 
        s.series_id as tournament_id,
        s.series_name as tournament_name,
        s.season_year,
        s.start_date,
        s.end_date,
        s.format,
        s.authority,
        s.num_teams,
        s.total_matches,
        s.is_completed,
        s.created_at,
        
        -- Match statistics
        COUNT(DISTINCT m.match_id) as matches_scheduled,
        COUNT(DISTINCT CASE WHEN m.is_completed = TRUE THEN m.match_id END) as matches_completed,
        COUNT(DISTINCT CASE WHEN m.match_status = 'live' THEN m.match_id END) as matches_live,
        
        -- Team statistics
        COUNT(DISTINCT pc.team_id) as teams_participating,
        COUNT(DISTINCT pc.player_id) as total_players,
        
        -- Tournament status
        CASE 
          WHEN s.start_date > CURDATE() THEN 'upcoming'
          WHEN s.end_date < CURDATE() OR s.is_completed = TRUE THEN 'completed'
          ELSE 'ongoing'
        END as tournament_status,
        
        -- Winner information (for completed tournaments)
        winner_info.team_name as tournament_winner,
        winner_info.team_code as winner_code
        
      FROM Series s
      LEFT JOIN Matches m ON s.series_id = m.series_id
      LEFT JOIN PlayerContracts pc ON s.series_id = pc.series_id
      LEFT JOIN (
        SELECT 
          m.series_id,
          t.team_name,
          t.team_code
        FROM Matches m
        JOIN Teams t ON m.winner_id = t.team_id
        WHERE m.match_type = 'final' AND m.is_completed = TRUE
      ) winner_info ON s.series_id = winner_info.series_id
      WHERE 1=1
    `;

      const params: any[] = [];

      if (year) {
         query += " AND s.season_year = ?";
         params.push(parseInt(year));
      }

      if (status) {
         if (status === "upcoming") {
            query += " AND s.start_date > CURDATE()";
         } else if (status === "ongoing") {
            query +=
               " AND s.start_date <= CURDATE() AND (s.end_date >= CURDATE() OR s.end_date IS NULL) AND s.is_completed = FALSE";
         } else if (status === "completed") {
            query += " AND (s.end_date < CURDATE() OR s.is_completed = TRUE)";
         }
      }

      query += `
      GROUP BY s.series_id, s.series_name, s.season_year, s.start_date, s.end_date, 
               s.format, s.authority, s.num_teams, s.total_matches, s.is_completed, s.created_at,
               winner_info.team_name, winner_info.team_code
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
            error: "Failed to fetch tournaments",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// POST /api/tournaments - Create new tournament (admin only)
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         tournament_name,
         season_year,
         start_date,
         end_date,
         format = "T20",
         authority = "BCCI",
         num_teams = 10,
         total_matches,
      } = body;

      // Validate required fields
      if (!tournament_name || !season_year) {
         return NextResponse.json(
            {
               success: false,
               error: "Missing required fields: tournament_name, season_year",
            },
            { status: 400 }
         );
      }

      // Check if tournament already exists for this year
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
               error: "Tournament already exists for this year",
            },
            { status: 409 }
         );
      }

      // Insert new tournament (using Series table)
      const insertQuery = `
      INSERT INTO Series 
      (series_name, season_year, start_date, end_date, format, authority, num_teams, total_matches)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const [result] = await pool.execute(insertQuery, [
         tournament_name,
         season_year,
         start_date || null,
         end_date || null,
         format,
         authority,
         num_teams,
         total_matches || null,
      ]);

      const insertResult = result as any;

      // Fetch the created tournament
      const selectQuery = `
      SELECT 
        series_id as tournament_id,
        series_name as tournament_name,
        season_year,
        start_date,
        end_date,
        format,
        authority,
        num_teams,
        total_matches,
        is_completed,
        created_at,
        'upcoming' as tournament_status
      FROM Series
      WHERE series_id = ?
    `;

      const [newRecord] = await pool.execute<RowDataPacket[]>(selectQuery, [
         insertResult.insertId,
      ]);

      return NextResponse.json(
         {
            success: true,
            message: "Tournament created successfully",
            data: newRecord[0],
         },
         { status: 201 }
      );
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to create tournament",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
