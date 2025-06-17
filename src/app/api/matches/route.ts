import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";
import { formatDate, formatTime } from "../../../lib/utils";

interface Match extends RowDataPacket {
   match_id: number;
   series_id: number;
   match_number: number;
   match_type: string;
   team1_id: number;
   team2_id: number;
   stadium_id: number;
   match_date: string;
   match_time: string;
   match_status: string;
   toss_winner_id: number;
   toss_decision: string;
   winner_id: number;
   win_type: string;
   win_margin: number;
   man_of_match_id: number;
   weather_conditions: string;
   pitch_conditions: string;
   is_day_night: boolean;
   super_over_required: boolean;
   impact_player_used_team1: boolean;
   impact_player_used_team2: boolean;
   is_completed: boolean;
}

interface MatchWithDetails extends Match {
   team1_name: string;
   team1_code: string;
   team2_name: string;
   team2_code: string;
   stadium_name: string;
   stadium_city: string;
   series_name: string;
   season_year: number;
   toss_winner_name: string;
   winner_name: string;
   man_of_match_name: string;
}

// GET /api/matches - Get all matches with filters
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const team = searchParams.get("team");
      const season = searchParams.get("season");
      const venue = searchParams.get("venue");
      const status = searchParams.get("status");
      const matchType = searchParams.get("type");
      const fromDate = searchParams.get("from_date");
      const toDate = searchParams.get("to_date");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const offset = (page - 1) * limit;

      let query = `
      SELECT 
        m.*,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        s.stadium_name,
        s.city as stadium_city,
        se.series_name,
        se.season_year,
        tw.team_name as toss_winner_name,
        w.team_name as winner_name,
        p.player_name as man_of_match_name
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Stadiums s ON m.stadium_id = s.stadium_id
      JOIN Series se ON m.series_id = se.series_id
      LEFT JOIN Teams tw ON m.toss_winner_id = tw.team_id
      LEFT JOIN Teams w ON m.winner_id = w.team_id
      LEFT JOIN Players p ON m.man_of_match_id = p.player_id
    `;

      const conditions: string[] = [];
      const params: any[] = [];

      if (team) {
         conditions.push(
            "(t1.team_name LIKE ? OR t1.team_code LIKE ? OR t2.team_name LIKE ? OR t2.team_code LIKE ?)"
         );
         params.push(`%${team}%`, `%${team}%`, `%${team}%`, `%${team}%`);
      }

      if (season) {
         conditions.push("se.season_year = ?");
         params.push(parseInt(season));
      }

      if (venue) {
         conditions.push("(s.stadium_name LIKE ? OR s.city LIKE ?)");
         params.push(`%${venue}%`, `%${venue}%`);
      }

      if (status) {
         conditions.push("m.match_status = ?");
         params.push(status);
      }

      if (matchType) {
         conditions.push("m.match_type = ?");
         params.push(matchType);
      }

      if (fromDate) {
         conditions.push("m.match_date >= ?");
         params.push(fromDate);
      }

      if (toDate) {
         conditions.push("m.match_date <= ?");
         params.push(toDate);
      }

      if (conditions.length > 0) {
         query += " WHERE " + conditions.join(" AND ");
      }

      query +=
         " ORDER BY m.match_date DESC, m.match_time DESC LIMIT ? OFFSET ?";
      params.push(limit, offset);

      const [rows] = await pool.execute<MatchWithDetails[]>(query, params);

      // Get total count
      let countQuery = `
      SELECT COUNT(*) as total
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Stadiums s ON m.stadium_id = s.stadium_id
      JOIN Series se ON m.series_id = se.series_id
    `;

      if (conditions.length > 0) {
         countQuery += " WHERE " + conditions.slice(0, -2).join(" AND ");
      }

      const [countResult] = await pool.execute<RowDataPacket[]>(
         countQuery,
         params.slice(0, -2)
      );

      const totalMatches = countResult[0].total;
      const totalPages = Math.ceil(totalMatches / limit);

      return NextResponse.json({
         success: true,
         data: rows.map((match) => ({
            ...match,
            formatted_date: formatDate(match.match_date),
            formatted_time: match.match_time
               ? formatTime(match.match_time)
               : null,
         })),
         pagination: {
            currentPage: page,
            totalPages,
            totalMatches,
            hasNextPage: page < totalPages,
            hasPreviousPage: page > 1,
         },
      });
   } catch (error) {
      console.error("Error fetching matches:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch matches" },
         { status: 500 }
      );
   }
}

// POST /api/matches - Create new match (admin only)
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         series_id,
         match_number,
         match_type = "league",
         team1_id,
         team2_id,
         stadium_id,
         match_date,
         match_time,
         weather_conditions,
         pitch_conditions,
         is_day_night = true,
      } = body;

      // Validate required fields
      if (!series_id || !team1_id || !team2_id || !stadium_id || !match_date) {
         return NextResponse.json(
            {
               success: false,
               error: "Missing required fields: series_id, team1_id, team2_id, stadium_id, match_date",
            },
            { status: 400 }
         );
      }

      // Validate teams are different
      if (team1_id === team2_id) {
         return NextResponse.json(
            { success: false, error: "Team1 and Team2 must be different" },
            { status: 400 }
         );
      }

      // Validate match type
      const validMatchTypes = [
         "league",
         "qualifier1",
         "qualifier2",
         "eliminator",
         "final",
      ];
      if (!validMatchTypes.includes(match_type)) {
         return NextResponse.json(
            { success: false, error: "Invalid match type" },
            { status: 400 }
         );
      }

      // Check if teams and stadium exist
      const [teamCheck] = await pool.execute<RowDataPacket[]>(
         "SELECT COUNT(*) as count FROM Teams WHERE team_id IN (?, ?) AND is_active = true",
         [team1_id, team2_id]
      );

      if (teamCheck[0].count !== 2) {
         return NextResponse.json(
            {
               success: false,
               error: "One or both teams not found or inactive",
            },
            { status: 400 }
         );
      }

      const [stadiumCheck] = await pool.execute<RowDataPacket[]>(
         "SELECT COUNT(*) as count FROM Stadiums WHERE stadium_id = ?",
         [stadium_id]
      );

      if (stadiumCheck[0].count === 0) {
         return NextResponse.json(
            { success: false, error: "Stadium not found" },
            { status: 400 }
         );
      }

      const [seriesCheck] = await pool.execute<RowDataPacket[]>(
         "SELECT COUNT(*) as count FROM Series WHERE series_id = ?",
         [series_id]
      );

      if (seriesCheck[0].count === 0) {
         return NextResponse.json(
            { success: false, error: "Series not found" },
            { status: 400 }
         );
      }

      const query = `
      INSERT INTO Matches (
        series_id, match_number, match_type, team1_id, team2_id, stadium_id,
        match_date, match_time, weather_conditions, pitch_conditions, is_day_night
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

      const [result] = await pool.execute<ResultSetHeader>(query, [
         series_id,
         match_number || null,
         match_type,
         team1_id,
         team2_id,
         stadium_id,
         match_date,
         match_time || null,
         weather_conditions || null,
         pitch_conditions || null,
         is_day_night,
      ]);

      // Fetch the created match with details
      const [createdMatch] = await pool.execute<MatchWithDetails[]>(
         `SELECT 
        m.*,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        s.stadium_name,
        s.city as stadium_city,
        se.series_name,
        se.season_year
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Stadiums s ON m.stadium_id = s.stadium_id
      JOIN Series se ON m.series_id = se.series_id
      WHERE m.match_id = ?`,
         [result.insertId]
      );

      return NextResponse.json(
         {
            success: true,
            data: createdMatch[0],
            message: "Match created successfully",
         },
         { status: 201 }
      );
   } catch (error) {
      console.error("Error creating match:", error);
      return NextResponse.json(
         { success: false, error: "Failed to create match" },
         { status: 500 }
      );
   }
}
