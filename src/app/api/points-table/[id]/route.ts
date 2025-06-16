import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

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

      // First check if the series exists
      const [seriesCheck] = await pool.execute(
         "SELECT series_id, series_name, season_year FROM Series WHERE series_id = ?",
         [seriesId]
      );

      if (!seriesCheck || (seriesCheck as RowDataPacket[]).length === 0) {
         return NextResponse.json(
            { success: false, error: "Series not found" },
            { status: 404 }
         );
      }

      // Get points table data - first try from TeamStats table, then calculate from Matches
      const [teamStatsData] = await pool.execute(
         `
         SELECT 
            t.team_id,
            t.team_name,
            t.team_code,
            t.team_color,
            COALESCE(ts.matches_played, 0) as matches_played,
            COALESCE(ts.matches_won, 0) as matches_won,
            COALESCE(ts.matches_lost, 0) as matches_lost,
            COALESCE(ts.no_results, 0) as no_results,
            COALESCE(ts.points, 0) as points,
            COALESCE(ts.net_run_rate, 0.00) as net_run_rate
         FROM Teams t
         LEFT JOIN TeamStats ts ON t.team_id = ts.team_id AND ts.series_id = ?
         WHERE ts.series_id = ? OR EXISTS (
            SELECT 1 FROM Matches m 
            WHERE (m.team1_id = t.team_id OR m.team2_id = t.team_id) 
            AND m.series_id = ?
         )
         ORDER BY COALESCE(ts.points, 0) DESC, COALESCE(ts.net_run_rate, 0) DESC, t.team_name ASC
         `,
         [seriesId, seriesId, seriesId]
      );

      // If no team stats exist or all are empty, calculate from matches
      const hasTeamStats = (teamStatsData as RowDataPacket[]).some(
         (team: any) => team.matches_played > 0
      );

      if (!hasTeamStats) {
         const [calculatedData] = await pool.execute(
            `
            SELECT 
               t.team_id,
               t.team_name,
               t.team_code,
               t.team_color,
               COUNT(DISTINCT m.match_id) as matches_played,
               COUNT(DISTINCT CASE WHEN m.winner_id = t.team_id THEN m.match_id END) as matches_won,
               COUNT(DISTINCT CASE WHEN m.winner_id IS NOT NULL AND m.winner_id != t.team_id THEN m.match_id END) as matches_lost,
               COUNT(DISTINCT CASE WHEN m.winner_id IS NULL AND m.is_completed = 1 THEN m.match_id END) as no_results,
               (COUNT(DISTINCT CASE WHEN m.winner_id = t.team_id THEN m.match_id END) * 2) + 
               (COUNT(DISTINCT CASE WHEN m.winner_id IS NULL AND m.is_completed = 1 THEN m.match_id END) * 1) as points,
               0.00 as net_run_rate
            FROM Teams t
            LEFT JOIN Matches m ON (m.team1_id = t.team_id OR m.team2_id = t.team_id) AND m.series_id = ?
            WHERE EXISTS (
               SELECT 1 FROM Matches m2 
               WHERE (m2.team1_id = t.team_id OR m2.team2_id = t.team_id) 
               AND m2.series_id = ?
            )
            GROUP BY t.team_id, t.team_name, t.team_code, t.team_color
            ORDER BY points DESC, net_run_rate DESC, t.team_name ASC
            `,
            [seriesId, seriesId]
         );

         return NextResponse.json(calculatedData);
      }

      return NextResponse.json(teamStatsData);
   } catch (error) {
      console.error("Error fetching points table:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch points table" },
         { status: 500 }
      );
   }
}
