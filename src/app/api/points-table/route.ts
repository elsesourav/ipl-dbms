import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season") || "2024";

      // Get series for the season
      const [seriesRows] = await pool.execute(
         `
      SELECT series_id FROM Series WHERE season_year = ?
    `,
         [season]
      );

      if (!seriesRows || (seriesRows as any[]).length === 0) {
         await pool.end();
         return NextResponse.json(
            { error: "Season not found" },
            { status: 404 }
         );
      }

      const seriesId = (seriesRows as any[])[0].series_id;

      // Get points table
      const [pointsRows] = await pool.execute(
         `
      SELECT 
        t.team_id,
        t.team_name,
        t.team_code,
        t.team_color,
        ts.matches_played,
        ts.matches_won,
        ts.matches_lost,
        ts.no_results,
        ts.points,
        ts.net_run_rate
      FROM Teams t
      LEFT JOIN TeamStats ts ON t.team_id = ts.team_id AND ts.series_id = ?
      WHERE ts.series_id IS NOT NULL OR EXISTS (
        SELECT 1 FROM Matches m 
        WHERE (m.team1_id = t.team_id OR m.team2_id = t.team_id) 
        AND m.series_id = ?
      )
      ORDER BY ts.points DESC, ts.net_run_rate DESC, t.team_name
    `,
         [seriesId, seriesId]
      );

      // If no team stats exist, calculate them from matches
      if (!pointsRows || (pointsRows as any[]).length === 0) {
         const [calculatedRows] = await pool.execute(
            `
        SELECT 
          t.team_id,
          t.team_name,
          t.team_code,
          t.team_color,
          COUNT(m.match_id) as matches_played,
          COUNT(CASE WHEN m.winner_id = t.team_id THEN 1 END) as matches_won,
          COUNT(CASE WHEN m.winner_id IS NOT NULL AND m.winner_id != t.team_id THEN 1 END) as matches_lost,
          COUNT(CASE WHEN m.winner_id IS NULL THEN 1 END) as no_results,
          (COUNT(CASE WHEN m.winner_id = t.team_id THEN 1 END) * 2) + 
          (COUNT(CASE WHEN m.winner_id IS NULL THEN 1 END) * 1) as points,
          0.00 as net_run_rate
        FROM Teams t
        LEFT JOIN (
          SELECT team1_id as team_id, winner_id, match_id FROM Matches WHERE series_id = ?
          UNION ALL
          SELECT team2_id as team_id, winner_id, match_id FROM Matches WHERE series_id = ?
        ) m ON t.team_id = m.team_id
        WHERE m.match_id IS NOT NULL
        GROUP BY t.team_id, t.team_name, t.team_code, t.team_color
        ORDER BY points DESC, matches_won DESC, t.team_name
      `,
            [seriesId, seriesId]
         );

         await pool.end();

         console.log("Calculated Points Table Rows:");
         console.log(calculatedRows);

         return NextResponse.json({
            season: parseInt(season),
            points_table: calculatedRows,
         });
      }

      await pool.end();

      return NextResponse.json({
         season: parseInt(season),
         points_table: pointsRows,
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
