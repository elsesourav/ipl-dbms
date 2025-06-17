import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/stadiums/[id] - Get stadium details
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const stadiumId = parseInt(params.id);

      if (isNaN(stadiumId)) {
         return NextResponse.json(
            { success: false, error: "Invalid stadium ID" },
            { status: 400 }
         );
      }

      const stadiumQuery = `
      SELECT 
        s.*,
        COUNT(DISTINCT m.match_id) as total_matches,
        COUNT(DISTINCT CASE WHEN m.is_completed = TRUE THEN m.match_id END) as completed_matches,
        COUNT(DISTINCT m.series_id) as seasons_hosted,
        AVG(CASE WHEN m.is_completed = TRUE THEN (
          SELECT SUM(runs_scored) FROM BattingScorecard WHERE match_id = m.match_id
        ) END) as avg_total_runs
      FROM Stadiums s
      LEFT JOIN Matches m ON s.stadium_id = m.stadium_id
      WHERE s.stadium_id = ?
      GROUP BY s.stadium_id, s.stadium_name, s.city, s.state, s.country, 
               s.capacity, s.established_year, s.created_at
    `;

      const [stadiumRows] = await pool.execute<RowDataPacket[]>(stadiumQuery, [
         stadiumId,
      ]);

      if (stadiumRows.length === 0) {
         return NextResponse.json(
            { success: false, error: "Stadium not found" },
            { status: 404 }
         );
      }

      const stadium = stadiumRows[0];

      // Get recent matches at this stadium
      const recentMatchesQuery = `
      SELECT 
        m.match_id,
        m.match_number,
        m.match_date,
        m.match_type,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        w.team_name as winner_name,
        w.team_code as winner_code,
        m.win_type,
        m.win_margin,
        s.season_year
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Series s ON m.series_id = s.series_id
      LEFT JOIN Teams w ON m.winner_id = w.team_id
      WHERE m.stadium_id = ? AND m.is_completed = TRUE
      ORDER BY m.match_date DESC
      LIMIT 10
    `;

      const [recentMatches] = await pool.execute<RowDataPacket[]>(
         recentMatchesQuery,
         [stadiumId]
      );

      // Get upcoming matches at this stadium
      const upcomingMatchesQuery = `
      SELECT 
        m.match_id,
        m.match_number,
        m.match_date,
        m.match_time,
        m.match_type,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        s.season_year
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Series s ON m.series_id = s.series_id
      WHERE m.stadium_id = ? AND m.match_status = 'scheduled'
      ORDER BY m.match_date ASC
      LIMIT 5
    `;

      const [upcomingMatches] = await pool.execute<RowDataPacket[]>(
         upcomingMatchesQuery,
         [stadiumId]
      );

      return NextResponse.json({
         success: true,
         data: {
            stadium: stadium,
            recent_matches: recentMatches,
            upcoming_matches: upcomingMatches,
         },
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch stadium details",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// PUT /api/stadiums/[id] - Update stadium (admin only)
export async function PUT(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const stadiumId = parseInt(params.id);

      if (isNaN(stadiumId)) {
         return NextResponse.json(
            { success: false, error: "Invalid stadium ID" },
            { status: 400 }
         );
      }

      const body = await request.json();
      const { stadium_name, city, state, country, capacity, established_year } =
         body;

      // Check if stadium exists
      const checkQuery = "SELECT stadium_id FROM Stadiums WHERE stadium_id = ?";
      const [existing] = await pool.execute<RowDataPacket[]>(checkQuery, [
         stadiumId,
      ]);

      if (existing.length === 0) {
         return NextResponse.json(
            { success: false, error: "Stadium not found" },
            { status: 404 }
         );
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];

      if (stadium_name !== undefined) {
         updates.push("stadium_name = ?");
         values.push(stadium_name);
      }

      if (city !== undefined) {
         updates.push("city = ?");
         values.push(city);
      }

      if (state !== undefined) {
         updates.push("state = ?");
         values.push(state);
      }

      if (country !== undefined) {
         updates.push("country = ?");
         values.push(country);
      }

      if (capacity !== undefined) {
         updates.push("capacity = ?");
         values.push(capacity);
      }

      if (established_year !== undefined) {
         updates.push("established_year = ?");
         values.push(established_year);
      }

      if (updates.length === 0) {
         return NextResponse.json(
            { success: false, error: "No fields to update" },
            { status: 400 }
         );
      }

      values.push(stadiumId);

      const updateQuery = `
      UPDATE Stadiums 
      SET ${updates.join(", ")}
      WHERE stadium_id = ?
    `;

      await pool.execute<ResultSetHeader>(updateQuery, values);

      // Fetch updated stadium
      const selectQuery = `
      SELECT * FROM Stadiums WHERE stadium_id = ?
    `;

      const [updatedStadium] = await pool.execute<RowDataPacket[]>(
         selectQuery,
         [stadiumId]
      );

      return NextResponse.json({
         success: true,
         message: "Stadium updated successfully",
         data: updatedStadium[0],
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to update stadium",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// DELETE /api/stadiums/[id] - Delete stadium (admin only)
export async function DELETE(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const stadiumId = parseInt(params.id);

      if (isNaN(stadiumId)) {
         return NextResponse.json(
            { success: false, error: "Invalid stadium ID" },
            { status: 400 }
         );
      }

      // Check if stadium exists
      const checkQuery =
         "SELECT stadium_id, stadium_name FROM Stadiums WHERE stadium_id = ?";
      const [existing] = await pool.execute<RowDataPacket[]>(checkQuery, [
         stadiumId,
      ]);

      if (existing.length === 0) {
         return NextResponse.json(
            { success: false, error: "Stadium not found" },
            { status: 404 }
         );
      }

      // Check if stadium is used in any matches
      const matchesQuery =
         "SELECT COUNT(*) as match_count FROM Matches WHERE stadium_id = ?";
      const [matchesResult] = await pool.execute<RowDataPacket[]>(
         matchesQuery,
         [stadiumId]
      );

      if (matchesResult[0].match_count > 0) {
         return NextResponse.json(
            {
               success: false,
               error: "Cannot delete stadium that has hosted matches",
               matches_count: matchesResult[0].match_count,
            },
            { status: 409 }
         );
      }

      // Delete stadium
      const deleteQuery = "DELETE FROM Stadiums WHERE stadium_id = ?";
      await pool.execute<ResultSetHeader>(deleteQuery, [stadiumId]);

      return NextResponse.json({
         success: true,
         message: "Stadium deleted successfully",
         data: {
            stadium_id: stadiumId,
            stadium_name: existing[0].stadium_name,
         },
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to delete stadium",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
