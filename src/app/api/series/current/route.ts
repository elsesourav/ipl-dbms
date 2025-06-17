import { RowDataPacket } from "mysql2";
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

// GET /api/series/current - Get current active season
export async function GET(request: NextRequest) {
   try {
      const currentSeriesQuery = `
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
      WHERE is_active = true
      ORDER BY start_date DESC 
      LIMIT 1
    `;

      const [currentSeries] = await pool.execute<Series[]>(currentSeriesQuery);

      if (!currentSeries || currentSeries.length === 0) {
         return NextResponse.json(
            { success: false, error: "No active series found" },
            { status: 404 }
         );
      }

      const series = currentSeries[0];

      // Get additional stats for current series
      const statsQuery = `
      SELECT 
        COUNT(DISTINCT m.match_id) as matches_played,
        COUNT(DISTINCT CASE WHEN m.status = 'completed' THEN m.match_id END) as matches_completed,
        COUNT(DISTINCT CASE WHEN m.status = 'upcoming' THEN m.match_id END) as matches_upcoming,
        COUNT(DISTINCT CASE WHEN m.status = 'live' THEN m.match_id END) as matches_live,
        COUNT(DISTINCT t.team_id) as participating_teams
      FROM matches m
      LEFT JOIN teams t ON (m.team1_id = t.team_id OR m.team2_id = t.team_id)
      WHERE m.series_id = ?
    `;

      const [stats] = await pool.execute<RowDataPacket[]>(statsQuery, [
         series.series_id,
      ]);

      return NextResponse.json({
         success: true,
         data: {
            ...series,
            stats: stats && stats.length > 0 ? stats[0] : {},
         },
      });
   } catch (error) {
      console.error("Error fetching current series:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch current series" },
         { status: 500 }
      );
   }
}
