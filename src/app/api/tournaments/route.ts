import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
   try {
      // Get all tournaments (series) with match counts and winner info
      const [tournaments] = await pool.execute(`
      SELECT 
        s.series_id,
        s.series_name,
        s.start_date,
        s.end_date,
        s.season_year,
        COUNT(m.match_id) as total_matches,
        COUNT(CASE WHEN m.winner_id IS NOT NULL THEN 1 END) as completed_matches,
        (SELECT winner_id 
         FROM Matches 
         WHERE series_id = s.series_id AND match_type = 'Final' 
         LIMIT 1) as champion,
        GROUP_CONCAT(DISTINCT 
          CASE 
            WHEN m.team1_id IS NOT NULL THEN m.team1_id 
            WHEN m.team2_id IS NOT NULL THEN m.team2_id 
          END
        ) as participating_teams
      FROM Series s
      LEFT JOIN Matches m ON s.series_id = m.series_id
      GROUP BY s.series_id, s.series_name, s.start_date, s.end_date, s.season_year
      ORDER BY s.end_date DESC, s.season_year DESC
    `);

      // Get current/ongoing tournaments
      const [ongoingTournaments] = await pool.execute(`
      SELECT 
        s.*,
        COUNT(m.match_id) as total_matches,
        COUNT(CASE WHEN m.winner_id IS NOT NULL THEN 1 END) as completed_matches
      FROM Series s
      LEFT JOIN Matches m ON s.series_id = m.series_id
      WHERE s.end_date >= CURDATE() AND s.start_date <= CURDATE()
      GROUP BY s.series_id
      ORDER BY s.start_date ASC
    `);

      // Get upcoming tournaments
      const [upcomingTournaments] = await pool.execute(`
      SELECT 
        s.*,
        COUNT(m.match_id) as scheduled_matches
      FROM Series s
      LEFT JOIN Matches m ON s.series_id = m.series_id
      WHERE s.start_date > CURDATE()
      GROUP BY s.series_id
      ORDER BY s.start_date ASC
      LIMIT 5
    `);

      // Get past tournaments with champions
      const [pastTournaments] = await pool.execute(`
      SELECT 
        s.*,
        COUNT(m.match_id) as total_matches,
        (SELECT winner_id 
         FROM Matches 
         WHERE series_id = s.series_id AND match_type = 'Final' 
         LIMIT 1) as champion
      FROM Series s
      LEFT JOIN Matches m ON s.series_id = m.series_id
      WHERE s.end_date < CURDATE()
      GROUP BY s.series_id
      ORDER BY s.end_date DESC
      LIMIT 10
    `);

      const tournamentData = {
         all: tournaments as RowDataPacket[],
         ongoing: ongoingTournaments as RowDataPacket[],
         upcoming: upcomingTournaments as RowDataPacket[],
         past: pastTournaments as RowDataPacket[],
      };

      return NextResponse.json({ success: true, data: tournamentData });
   } catch (error) {
      console.error("Error fetching tournaments:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch tournaments" },
         { status: 500 }
      );
   }
}

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { series_name, start_date, end_date, season_year } = body;

      if (!series_name || !start_date || !end_date) {
         return NextResponse.json(
            { success: false, error: "Missing required fields" },
            { status: 400 }
         );
      }

      const [result] = await pool.execute(
         "INSERT INTO Series (series_name, start_date, end_date, season_year) VALUES (?, ?, ?, ?)",
         [
            series_name,
            start_date,
            end_date,
            season_year || new Date().getFullYear(),
         ]
      );

      return NextResponse.json({
         success: true,
         message: "Tournament created successfully",
         data: { id: (result as any).insertId },
      });
   } catch (error) {
      console.error("Error creating tournament:", error);
      return NextResponse.json(
         { success: false, error: "Failed to create tournament" },
         { status: 500 }
      );
   }
}
