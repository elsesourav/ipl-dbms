import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";

interface Stadium extends RowDataPacket {
   stadium_id: number;
   stadium_name: string;
   city: string;
   state: string;
   country: string;
   capacity: number;
   established_year: number;
   created_at: string;
}

interface StadiumWithStats extends Stadium {
   total_matches: number;
   home_team_wins: number;
   away_team_wins: number;
   average_first_innings_score: number;
   highest_team_score: number;
}

// GET /api/stadiums - Get all stadiums with optional filters
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const city = searchParams.get("city");
      const state = searchParams.get("state");
      const country = searchParams.get("country");
      const search = searchParams.get("search");
      const includeStats = searchParams.get("include_stats") === "true";

      let query = `
      SELECT DISTINCT s.*
      ${
         includeStats
            ? `, 
        COUNT(m.match_id) as total_matches,
        SUM(CASE WHEN m.winner_id = m.team1_id THEN 1 ELSE 0 END) as home_team_wins,
        SUM(CASE WHEN m.winner_id = m.team2_id THEN 1 ELSE 0 END) as away_team_wins,
        AVG(CASE WHEN bs.team_id = m.team1_id THEN bs.runs_scored END) as avg_first_innings_score,
        MAX(bs.runs_scored) as highest_team_score`
            : ""
      }
      FROM Stadiums s
      ${
         includeStats
            ? `
        LEFT JOIN Matches m ON s.stadium_id = m.stadium_id AND m.is_completed = true
        LEFT JOIN (
          SELECT match_id, team_id, SUM(runs_scored) as runs_scored
          FROM BattingScorecard 
          GROUP BY match_id, team_id
        ) bs ON m.match_id = bs.match_id`
            : ""
      }
    `;

      const conditions: string[] = [];
      const params: any[] = [];

      if (city) {
         conditions.push("s.city LIKE ?");
         params.push(`%${city}%`);
      }

      if (state) {
         conditions.push("s.state LIKE ?");
         params.push(`%${state}%`);
      }

      if (country) {
         conditions.push("s.country LIKE ?");
         params.push(`%${country}%`);
      }

      if (search) {
         conditions.push("(s.stadium_name LIKE ? OR s.city LIKE ?)");
         params.push(`%${search}%`, `%${search}%`);
      }

      if (conditions.length > 0) {
         query += " WHERE " + conditions.join(" AND ");
      }

      if (includeStats) {
         query += " GROUP BY s.stadium_id";
      }

      query += " ORDER BY s.stadium_name";

      const [rows] = await pool.execute<StadiumWithStats[]>(query, params);

      return NextResponse.json({
         success: true,
         data: rows,
         count: rows.length,
      });
   } catch (error) {
      console.error("Error fetching stadiums:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch stadiums" },
         { status: 500 }
      );
   }
}

// POST /api/stadiums - Create new stadium (admin only)
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         stadium_name,
         city,
         state,
         country = "India",
         capacity,
         established_year,
      } = body;

      // Validate required fields
      if (!stadium_name || !city) {
         return NextResponse.json(
            {
               success: false,
               error: "Missing required fields: stadium_name, city",
            },
            { status: 400 }
         );
      }

      // Validate capacity if provided
      if (capacity && (capacity < 1000 || capacity > 200000)) {
         return NextResponse.json(
            {
               success: false,
               error: "Stadium capacity must be between 1,000 and 200,000",
            },
            { status: 400 }
         );
      }

      // Validate established year if provided
      const currentYear = new Date().getFullYear();
      if (
         established_year &&
         (established_year < 1800 || established_year > currentYear)
      ) {
         return NextResponse.json(
            {
               success: false,
               error: `Established year must be between 1800 and ${currentYear}`,
            },
            { status: 400 }
         );
      }

      // Check for duplicate stadium name in same city
      const [existingStadium] = await pool.execute<RowDataPacket[]>(
         "SELECT stadium_id FROM Stadiums WHERE stadium_name = ? AND city = ?",
         [stadium_name, city]
      );

      if (existingStadium.length > 0) {
         return NextResponse.json(
            {
               success: false,
               error: "Stadium with this name already exists in this city",
            },
            { status: 409 }
         );
      }

      const query = `
      INSERT INTO Stadiums (
        stadium_name, city, state, country, capacity, established_year
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;

      const [result] = await pool.execute<ResultSetHeader>(query, [
         stadium_name,
         city,
         state || null,
         country,
         capacity || null,
         established_year || null,
      ]);

      // Fetch the created stadium
      const [createdStadium] = await pool.execute<Stadium[]>(
         "SELECT * FROM Stadiums WHERE stadium_id = ?",
         [result.insertId]
      );

      return NextResponse.json(
         {
            success: true,
            data: createdStadium[0],
            message: "Stadium created successfully",
         },
         { status: 201 }
      );
   } catch (error) {
      console.error("Error creating stadium:", error);
      return NextResponse.json(
         { success: false, error: "Failed to create stadium" },
         { status: 500 }
      );
   }
}
