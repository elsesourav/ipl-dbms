import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";

interface Tournament extends RowDataPacket {
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

// GET /api/tournaments/[id] - Get tournament details
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const tournamentId = parseInt(params.id);

      if (isNaN(tournamentId)) {
         return NextResponse.json(
            { success: false, error: "Invalid tournament ID" },
            { status: 400 }
         );
      }

      // Get tournament details
      const tournamentQuery = `
      SELECT 
        s.series_id as tournament_id,
        s.series_name as tournament_name,
        s.season_year,
        s.start_date,
        s.end_date,
        s.format,
        s.authority,
        s.is_active,
        s.total_teams,
        s.total_matches,
        s.prize_money,
        s.description,
        s.created_at,
        s.updated_at
      FROM series s
      WHERE s.series_id = ?
    `;

      const [tournamentResult] = await pool.execute<Tournament[]>(
         tournamentQuery,
         [tournamentId]
      );

      if (!tournamentResult || tournamentResult.length === 0) {
         return NextResponse.json(
            { success: false, error: "Tournament not found" },
            { status: 404 }
         );
      }

      const tournament = tournamentResult[0];

      // Get participating teams
      const teamsQuery = `
      SELECT DISTINCT
        t.team_id,
        t.team_name,
        t.team_code,
        t.city,
        t.founded_year,
        t.owner,
        t.coach,
        t.primary_color,
        t.secondary_color
      FROM teams t
      JOIN matches m ON (m.team1_id = t.team_id OR m.team2_id = t.team_id)
      WHERE m.series_id = ? AND t.is_active = true
      ORDER BY t.team_name
    `;

      const [teams] = await pool.execute<RowDataPacket[]>(teamsQuery, [
         tournamentId,
      ]);

      // Get tournament statistics
      const statsQuery = `
      SELECT 
        COUNT(*) as total_matches_scheduled,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as matches_completed,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as matches_upcoming,
        COUNT(CASE WHEN status = 'live' THEN 1 END) as matches_live,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as matches_cancelled,
        COUNT(CASE WHEN result = 'No Result' THEN 1 END) as no_results,
        COUNT(CASE WHEN super_over_required = true THEN 1 END) as super_overs,
        MIN(match_date) as first_match_date,
        MAX(match_date) as last_match_date,
        COUNT(DISTINCT stadium_id) as venues_used,
        AVG(CASE WHEN ts.total_runs IS NOT NULL THEN ts.total_runs END) as avg_first_innings_score,
        MAX(ts.total_runs) as highest_team_score,
        MIN(CASE WHEN ts.total_runs > 0 THEN ts.total_runs END) as lowest_team_score
      FROM matches m
      LEFT JOIN team_stats ts ON m.match_id = ts.match_id AND ts.innings_number = 1
      WHERE m.series_id = ?
    `;

      const [stats] = await pool.execute<RowDataPacket[]>(statsQuery, [
         tournamentId,
      ]);

      // Get points table/standings
      const standingsQuery = `
      SELECT 
        t.team_id,
        t.team_name,
        t.team_code,
        t.primary_color,
        COUNT(*) as matches_played,
        COUNT(CASE 
          WHEN (m.team1_id = t.team_id AND m.result LIKE CONCAT(t.team_name, '%'))
            OR (m.team2_id = t.team_id AND m.result LIKE CONCAT(t.team_name, '%'))
          THEN 1 
        END) as matches_won,
        COUNT(CASE 
          WHEN (m.team1_id = t.team_id AND m.result NOT LIKE CONCAT(t.team_name, '%') AND m.result != 'No Result')
            OR (m.team2_id = t.team_id AND m.result NOT LIKE CONCAT(t.team_name, '%') AND m.result != 'No Result')
          THEN 1 
        END) as matches_lost,
        COUNT(CASE WHEN m.result = 'No Result' THEN 1 END) as no_results,
        -- Calculate points (2 for win, 1 for no result)
        (COUNT(CASE 
          WHEN (m.team1_id = t.team_id AND m.result LIKE CONCAT(t.team_name, '%'))
            OR (m.team2_id = t.team_id AND m.result LIKE CONCAT(t.team_name, '%'))
          THEN 1 
        END) * 2 + COUNT(CASE WHEN m.result = 'No Result' THEN 1 END)) as points,
        ROUND(
          COUNT(CASE 
            WHEN (m.team1_id = t.team_id AND m.result LIKE CONCAT(t.team_name, '%'))
              OR (m.team2_id = t.team_id AND m.result LIKE CONCAT(t.team_name, '%'))
            THEN 1 
          END) * 100.0 / COUNT(*), 2
        ) as win_percentage
      FROM matches m
      JOIN teams t ON (m.team1_id = t.team_id OR m.team2_id = t.team_id)
      WHERE m.series_id = ? AND m.status = 'completed'
      GROUP BY t.team_id, t.team_name, t.team_code, t.primary_color
      ORDER BY points DESC, win_percentage DESC, matches_won DESC
    `;

      const [standings] = await pool.execute<RowDataPacket[]>(standingsQuery, [
         tournamentId,
      ]);

      // Get recent matches
      const recentMatchesQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.match_time,
        m.status,
        m.result,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        s.stadium_name,
        s.city as stadium_city
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      WHERE m.series_id = ?
      ORDER BY m.match_date DESC, m.match_time DESC
      LIMIT 10
    `;

      const [recentMatches] = await pool.execute<RowDataPacket[]>(
         recentMatchesQuery,
         [tournamentId]
      );

      return NextResponse.json({
         success: true,
         data: {
            tournament,
            participating_teams: teams || [],
            statistics: stats && stats.length > 0 ? stats[0] : {},
            standings: standings || [],
            recent_matches: recentMatches || [],
         },
      });
   } catch (error) {
      console.error("Error fetching tournament details:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch tournament details" },
         { status: 500 }
      );
   }
}

// PUT /api/tournaments/[id] - Update tournament (admin only)
export async function PUT(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const tournamentId = parseInt(params.id);

      if (isNaN(tournamentId)) {
         return NextResponse.json(
            { success: false, error: "Invalid tournament ID" },
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
         tournamentId,
      ]);

      if (result.affectedRows === 0) {
         return NextResponse.json(
            { success: false, error: "Tournament not found" },
            { status: 404 }
         );
      }

      return NextResponse.json({
         success: true,
         message: "Tournament updated successfully",
      });
   } catch (error) {
      console.error("Error updating tournament:", error);
      return NextResponse.json(
         { success: false, error: "Failed to update tournament" },
         { status: 500 }
      );
   }
}

// DELETE /api/tournaments/[id] - Delete tournament (admin only)
export async function DELETE(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const tournamentId = parseInt(params.id);

      if (isNaN(tournamentId)) {
         return NextResponse.json(
            { success: false, error: "Invalid tournament ID" },
            { status: 400 }
         );
      }

      // Check if tournament has matches
      const matchCountQuery =
         "SELECT COUNT(*) as count FROM matches WHERE series_id = ?";
      const [matchCount] = await pool.execute<RowDataPacket[]>(
         matchCountQuery,
         [tournamentId]
      );

      if (matchCount && matchCount[0] && (matchCount[0] as any).count > 0) {
         return NextResponse.json(
            {
               success: false,
               error: "Cannot delete tournament with existing matches",
            },
            { status: 400 }
         );
      }

      const deleteQuery = "DELETE FROM series WHERE series_id = ?";
      const [result] = await pool.execute<ResultSetHeader>(deleteQuery, [
         tournamentId,
      ]);

      if (result.affectedRows === 0) {
         return NextResponse.json(
            { success: false, error: "Tournament not found" },
            { status: 404 }
         );
      }

      return NextResponse.json({
         success: true,
         message: "Tournament deleted successfully",
      });
   } catch (error) {
      console.error("Error deleting tournament:", error);
      return NextResponse.json(
         { success: false, error: "Failed to delete tournament" },
         { status: 500 }
      );
   }
}
