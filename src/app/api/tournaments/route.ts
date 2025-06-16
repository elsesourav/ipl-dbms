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
        s.season,
        COUNT(m.match_id) as total_matches,
        COUNT(CASE WHEN m.winner IS NOT NULL THEN 1 END) as completed_matches,
        (SELECT winner 
         FROM matches 
         WHERE series_id = s.series_id AND match_type = 'Final' 
         LIMIT 1) as champion,
        GROUP_CONCAT(DISTINCT 
          CASE 
            WHEN m.team1 IS NOT NULL THEN m.team1 
            WHEN m.team2 IS NOT NULL THEN m.team2 
          END
        ) as participating_teams
      FROM series s
      LEFT JOIN matches m ON s.series_id = m.series_id
      GROUP BY s.series_id, s.series_name, s.start_date, s.end_date, s.season
      ORDER BY s.start_date DESC
    `);

      // Get current/ongoing tournaments
      const [ongoingTournaments] = await pool.execute(`
      SELECT 
        s.*,
        COUNT(m.match_id) as total_matches,
        COUNT(CASE WHEN m.winner IS NOT NULL THEN 1 END) as completed_matches
      FROM series s
      LEFT JOIN matches m ON s.series_id = m.series_id
      WHERE s.end_date >= CURDATE() AND s.start_date <= CURDATE()
      GROUP BY s.series_id
      ORDER BY s.start_date ASC
    `);

      // Get upcoming tournaments
      const [upcomingTournaments] = await pool.execute(`
      SELECT 
        s.*,
        COUNT(m.match_id) as scheduled_matches
      FROM series s
      LEFT JOIN matches m ON s.series_id = m.series_id
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
        (SELECT winner 
         FROM matches 
         WHERE series_id = s.series_id AND match_type = 'Final' 
         LIMIT 1) as champion
      FROM series s
      LEFT JOIN matches m ON s.series_id = m.series_id
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
      const { series_name, start_date, end_date, season } = body;

      if (!series_name || !start_date || !end_date) {
         return NextResponse.json(
            { success: false, error: "Missing required fields" },
            { status: 400 }
         );
      }

      const [result] = await pool.execute(
         "INSERT INTO series (series_name, start_date, end_date, season) VALUES (?, ?, ?, ?)",
         [series_name, start_date, end_date, season || new Date().getFullYear()]
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
