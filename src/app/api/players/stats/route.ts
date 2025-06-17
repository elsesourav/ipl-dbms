import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/players/stats - Get aggregated player statistics
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const category = searchParams.get("category"); // 'batting', 'bowling', 'fielding', 'all'
      const teamId = searchParams.get("teamId");
      const limit = parseInt(searchParams.get("limit") || "20");
      const sortBy = searchParams.get("sortBy") || "runs"; // 'runs', 'wickets', 'average', 'strike_rate', etc.

      let currentSeason: number;
      if (season) {
         currentSeason = parseInt(season);
      } else {
         const seasonQuery =
            "SELECT MAX(season_year) as current_season FROM Series";
         const [seasonResult] = await pool.execute<RowDataPacket[]>(
            seasonQuery
         );
         currentSeason = seasonResult[0].current_season;
      }

      const seriesQuery = "SELECT series_id FROM Series WHERE season_year = ?";
      const [seriesResult] = await pool.execute<RowDataPacket[]>(seriesQuery, [
         currentSeason,
      ]);

      if (seriesResult.length === 0) {
         return NextResponse.json(
            {
               success: false,
               error: "Season not found",
            },
            { status: 404 }
         );
      }

      const seriesId = seriesResult[0].series_id;

      const stats: any = {};

      // Batting statistics
      if (!category || category === "batting" || category === "all") {
         let battingQuery = `
        SELECT 
          p.player_id,
          p.player_name,
          p.role,
          p.nationality,
          t.team_name,
          t.team_code,
          t.team_color,
          ps.matches_played,
          ps.runs_scored,
          ps.balls_faced,
          ps.fours,
          ps.sixes,
          ps.highest_score,
          ps.fifties,
          ps.hundreds,
          CASE WHEN ps.balls_faced > 0 THEN ROUND((ps.runs_scored * 100.0 / ps.balls_faced), 2) ELSE 0 END as strike_rate,
          CASE WHEN ps.matches_played > 0 THEN ROUND(ps.runs_scored / ps.matches_played, 2) ELSE 0 END as average_per_match,
          CASE WHEN ps.runs_scored > 0 THEN ROUND((ps.sixes * 6.0 / ps.runs_scored) * 100, 1) ELSE 0 END as six_percentage
        FROM Players p
        JOIN PlayerStats ps ON p.player_id = ps.player_id
        JOIN PlayerContracts pc ON p.player_id = pc.player_id AND pc.series_id = ps.series_id
        JOIN Teams t ON pc.team_id = t.team_id
        WHERE ps.series_id = ? AND ps.runs_scored > 0
      `;

         const params: any[] = [seriesId];

         if (teamId) {
            battingQuery += " AND t.team_id = ?";
            params.push(parseInt(teamId));
         }

         // Add sorting
         if (sortBy === "runs") {
            battingQuery += " ORDER BY ps.runs_scored DESC";
         } else if (sortBy === "average") {
            battingQuery += " ORDER BY average_per_match DESC";
         } else if (sortBy === "strike_rate") {
            battingQuery += " ORDER BY strike_rate DESC";
         } else if (sortBy === "sixes") {
            battingQuery += " ORDER BY ps.sixes DESC";
         } else {
            battingQuery += " ORDER BY ps.runs_scored DESC";
         }

         battingQuery += " LIMIT ?";
         params.push(limit);

         const [battingStats] = await pool.execute<RowDataPacket[]>(
            battingQuery,
            params
         );
         stats.batting = battingStats;
      }

      // Bowling statistics
      if (!category || category === "bowling" || category === "all") {
         let bowlingQuery = `
        SELECT 
          p.player_id,
          p.player_name,
          p.role,
          p.nationality,
          t.team_name,
          t.team_code,
          t.team_color,
          ps.matches_played,
          ps.overs_bowled,
          ps.runs_conceded,
          ps.wickets_taken,
          ps.best_bowling,
          CASE WHEN ps.overs_bowled > 0 THEN ROUND(ps.runs_conceded / ps.overs_bowled, 2) ELSE 0 END as economy_rate,
          CASE WHEN ps.wickets_taken > 0 THEN ROUND(ps.runs_conceded / ps.wickets_taken, 2) ELSE 0 END as bowling_average,
          CASE WHEN ps.wickets_taken > 0 THEN ROUND((ps.overs_bowled * 6) / ps.wickets_taken, 2) ELSE 0 END as bowling_strike_rate
        FROM Players p
        JOIN PlayerStats ps ON p.player_id = ps.player_id
        JOIN PlayerContracts pc ON p.player_id = pc.player_id AND pc.series_id = ps.series_id
        JOIN Teams t ON pc.team_id = t.team_id
        WHERE ps.series_id = ? AND ps.wickets_taken > 0
      `;

         const params: any[] = [seriesId];

         if (teamId) {
            bowlingQuery += " AND t.team_id = ?";
            params.push(parseInt(teamId));
         }

         // Add sorting
         if (sortBy === "wickets") {
            bowlingQuery += " ORDER BY ps.wickets_taken DESC";
         } else if (sortBy === "economy") {
            bowlingQuery += " ORDER BY economy_rate ASC";
         } else if (sortBy === "average") {
            bowlingQuery += " ORDER BY bowling_average ASC";
         } else {
            bowlingQuery += " ORDER BY ps.wickets_taken DESC";
         }

         bowlingQuery += " LIMIT ?";
         params.push(limit);

         const [bowlingStats] = await pool.execute<RowDataPacket[]>(
            bowlingQuery,
            params
         );
         stats.bowling = bowlingStats;
      }

      // Fielding statistics
      if (!category || category === "fielding" || category === "all") {
         let fieldingQuery = `
        SELECT 
          p.player_id,
          p.player_name,
          p.role,
          t.team_name,
          t.team_code,
          ps.matches_played,
          ps.catches,
          ps.stumping,
          (ps.catches + ps.stumping) as total_dismissals,
          CASE WHEN ps.matches_played > 0 THEN ROUND((ps.catches + ps.stumping) / ps.matches_played, 2) ELSE 0 END as dismissals_per_match
        FROM Players p
        JOIN PlayerStats ps ON p.player_id = ps.player_id
        JOIN PlayerContracts pc ON p.player_id = pc.player_id AND pc.series_id = ps.series_id
        JOIN Teams t ON pc.team_id = t.team_id
        WHERE ps.series_id = ? AND (ps.catches > 0 OR ps.stumping > 0)
      `;

         const params: any[] = [seriesId];

         if (teamId) {
            fieldingQuery += " AND t.team_id = ?";
            params.push(parseInt(teamId));
         }

         fieldingQuery +=
            " ORDER BY total_dismissals DESC, dismissals_per_match DESC LIMIT ?";
         params.push(limit);

         const [fieldingStats] = await pool.execute<RowDataPacket[]>(
            fieldingQuery,
            params
         );
         stats.fielding = fieldingStats;
      }

      // Get summary statistics
      const summaryQuery = `
      SELECT 
        COUNT(DISTINCT p.player_id) as total_players,
        COUNT(DISTINCT CASE WHEN ps.runs_scored > 0 THEN p.player_id END) as batsmen,
        COUNT(DISTINCT CASE WHEN ps.wickets_taken > 0 THEN p.player_id END) as bowlers,
        COUNT(DISTINCT CASE WHEN ps.catches > 0 OR ps.stumping > 0 THEN p.player_id END) as fielders,
        COUNT(DISTINCT CASE WHEN ps.hundreds > 0 THEN p.player_id END) as century_makers,
        COUNT(DISTINCT CASE WHEN ps.fifties > 0 THEN p.player_id END) as fifty_makers,
        MAX(ps.runs_scored) as highest_runs,
        MAX(ps.wickets_taken) as most_wickets,
        MAX(ps.catches + ps.stumping) as most_dismissals
      FROM Players p
      JOIN PlayerStats ps ON p.player_id = ps.player_id
      JOIN PlayerContracts pc ON p.player_id = pc.player_id AND pc.series_id = ps.series_id
      WHERE ps.series_id = ?
    `;

      const summaryParams: any[] = [seriesId];
      if (teamId) {
         // Note: For summary, we'd need to modify query if filtering by team
      }

      const [summary] = await pool.execute<RowDataPacket[]>(
         summaryQuery,
         summaryParams
      );

      return NextResponse.json({
         success: true,
         season: currentSeason,
         category: category || "all",
         filters: { teamId, sortBy, limit },
         summary: summary[0],
         data: stats,
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch player statistics",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
