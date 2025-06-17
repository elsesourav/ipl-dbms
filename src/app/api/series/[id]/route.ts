import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";

interface Series extends RowDataPacket {
   series_id: number;
   series_name: string;
   season_year: number;
   start_date: string;
   end_date: string;
   format: string;
   authority: string;
   is_active: boolean;
   total_teams: number;
   total_matches: number;
   prize_money: number;
   description: string;
}

// GET /api/series/[id] - Get season details
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const seriesId = parseInt(params.id);

      if (isNaN(seriesId)) {
         return NextResponse.json(
            { success: false, error: "Invalid series ID" },
            { status: 400 }
         );
      }

      const seriesQuery = `
      SELECT 
        series_id,
        series_name,
        season_year,
        start_date,
        end_date,
        format,
        authority,
        is_active,
        total_teams,
        total_matches,
        prize_money,
        description
      FROM series 
      WHERE series_id = ?
    `;

      const [seriesResult] = await pool.execute<Series[]>(seriesQuery, [
         seriesId,
      ]);

      if (!seriesResult || seriesResult.length === 0) {
         return NextResponse.json(
            { success: false, error: "Series not found" },
            { status: 404 }
         );
      }

      const series = seriesResult[0];

      // Get participating teams
      const teamsQuery = `
      SELECT DISTINCT
        t.team_id,
        t.team_name,
        t.team_code,
        t.city,
        t.primary_color,
        t.secondary_color
      FROM teams t
      JOIN matches m ON (m.team1_id = t.team_id OR m.team2_id = t.team_id)
      WHERE m.series_id = ? AND t.is_active = true
      ORDER BY t.team_name
    `;

      const [teams] = await pool.execute<RowDataPacket[]>(teamsQuery, [
         seriesId,
      ]);

      // Get match statistics
      const statsQuery = `
      SELECT 
        COUNT(*) as total_matches,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_matches,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming_matches,
        COUNT(CASE WHEN status = 'live' THEN 1 END) as live_matches,
        MIN(match_date) as first_match_date,
        MAX(match_date) as last_match_date
      FROM matches
      WHERE series_id = ?
    `;

      const [stats] = await pool.execute<RowDataPacket[]>(statsQuery, [
         seriesId,
      ]);

      return NextResponse.json({
         success: true,
         data: {
            ...series,
            teams: teams || [],
            statistics: stats && stats.length > 0 ? stats[0] : {},
         },
      });
   } catch (error) {
      console.error("Error fetching series details:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch series details" },
         { status: 500 }
      );
   }
}

// PUT /api/series/[id] - Update season (admin only)
export async function PUT(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const seriesId = parseInt(params.id);

      if (isNaN(seriesId)) {
         return NextResponse.json(
            { success: false, error: "Invalid series ID" },
            { status: 400 }
         );
      }

      const body = await request.json();
      const {
         series_name,
         season_year,
         start_date,
         end_date,
         format,
         authority,
         is_active,
         total_teams,
         total_matches,
         prize_money,
         description,
      } = body;

      // Validate required fields
      if (!series_name || !season_year || !start_date || !end_date) {
         return NextResponse.json(
            { success: false, error: "Required fields missing" },
            { status: 400 }
         );
      }

      const updateQuery = `
      UPDATE series SET 
        series_name = ?,
        season_year = ?,
        start_date = ?,
        end_date = ?,
        format = ?,
        authority = ?,
        is_active = ?,
        total_teams = ?,
        total_matches = ?,
        prize_money = ?,
        description = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE series_id = ?
    `;

      const [result] = await pool.execute<ResultSetHeader>(updateQuery, [
         series_name,
         season_year,
         start_date,
         end_date,
         format || "T20",
         authority || "BCCI",
         is_active !== undefined ? is_active : true,
         total_teams || 8,
         total_matches || 74,
         prize_money || 0,
         description || "",
         seriesId,
      ]);

      if (result.affectedRows === 0) {
         return NextResponse.json(
            { success: false, error: "Series not found" },
            { status: 404 }
         );
      }

      return NextResponse.json({
         success: true,
         message: "Series updated successfully",
      });
   } catch (error) {
      console.error("Error updating series:", error);
      return NextResponse.json(
         { success: false, error: "Failed to update series" },
         { status: 500 }
      );
   }
}

// DELETE /api/series/[id] - Delete season (admin only)
export async function DELETE(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const seriesId = parseInt(params.id);

      if (isNaN(seriesId)) {
         return NextResponse.json(
            { success: false, error: "Invalid series ID" },
            { status: 400 }
         );
      }

      // Check if series has matches
      const matchCountQuery =
         "SELECT COUNT(*) as count FROM matches WHERE series_id = ?";
      const [matchCount] = await pool.execute<RowDataPacket[]>(
         matchCountQuery,
         [seriesId]
      );

      if (matchCount && matchCount[0] && matchCount[0].count > 0) {
         return NextResponse.json(
            {
               success: false,
               error: "Cannot delete series with existing matches",
            },
            { status: 400 }
         );
      }

      const deleteQuery = "DELETE FROM series WHERE series_id = ?";
      const [result] = await pool.execute<ResultSetHeader>(deleteQuery, [
         seriesId,
      ]);

      if (result.affectedRows === 0) {
         return NextResponse.json(
            { success: false, error: "Series not found" },
            { status: 404 }
         );
      }

      return NextResponse.json({
         success: true,
         message: "Series deleted successfully",
      });
   } catch (error) {
      console.error("Error deleting series:", error);
      return NextResponse.json(
         { success: false, error: "Failed to delete series" },
         { status: 500 }
      );
   }
}
