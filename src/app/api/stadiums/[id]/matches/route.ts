import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../../lib/db";

// GET /api/stadiums/[id]/matches - Get all matches at a stadium
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const stadiumId = parseInt(params.id);
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const status = searchParams.get("status");
      const teamId = searchParams.get("team_id");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");

      if (isNaN(stadiumId)) {
         return NextResponse.json(
            { success: false, error: "Invalid stadium ID" },
            { status: 400 }
         );
      }

      // Check if stadium exists
      const stadiumQuery = `
      SELECT stadium_id, stadium_name, city, state, country, capacity
      FROM stadiums 
      WHERE stadium_id = ? AND is_active = true
    `;
      const [stadiumResult] = await pool.execute<RowDataPacket[]>(
         stadiumQuery,
         [stadiumId]
      );

      if (!stadiumResult || stadiumResult.length === 0) {
         return NextResponse.json(
            { success: false, error: "Stadium not found" },
            { status: 404 }
         );
      }

      const stadium = stadiumResult[0];

      // Build matches query
      let matchesQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.match_time,
        m.status,
        m.match_type,
        m.overs,
        m.result,
        m.margin_type,
        m.margin_value,
        m.toss_winner_id,
        m.toss_decision,
        se.season,
        se.series_name,
        t1.team_id as team1_id,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t1.primary_color as team1_color,
        t2.team_id as team2_id,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        t2.primary_color as team2_color,
        tw.team_name as toss_winner_name,
        tw.team_code as toss_winner_code,
        -- Team scores
        ts1.total_runs as team1_runs,
        ts1.total_wickets as team1_wickets,
        ts1.total_overs as team1_overs,
        ts2.total_runs as team2_runs,
        ts2.total_wickets as team2_wickets,
        ts2.total_overs as team2_overs
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      LEFT JOIN teams tw ON m.toss_winner_id = tw.team_id
      LEFT JOIN series se ON m.series_id = se.series_id
      LEFT JOIN team_stats ts1 ON m.match_id = ts1.match_id AND ts1.team_id = t1.team_id
      LEFT JOIN team_stats ts2 ON m.match_id = ts2.match_id AND ts2.team_id = t2.team_id
      WHERE m.stadium_id = ?
    `;

      let queryParams: any[] = [stadiumId];

      if (season) {
         matchesQuery += " AND se.season = ?";
         queryParams.push(season);
      }

      if (status) {
         matchesQuery += " AND m.status = ?";
         queryParams.push(status);
      }

      if (teamId) {
         const teamIdInt = parseInt(teamId);
         matchesQuery += " AND (m.team1_id = ? OR m.team2_id = ?)";
         queryParams.push(teamIdInt, teamIdInt);
      }

      matchesQuery += ` 
      ORDER BY m.match_date DESC, m.match_time DESC
      LIMIT ? OFFSET ?
    `;
      queryParams.push(limit, offset);

      const [matches] = await pool.execute<RowDataPacket[]>(
         matchesQuery,
         queryParams
      );

      // Get stadium statistics
      const statsQuery = `
      SELECT 
        COUNT(*) as total_matches,
        COUNT(CASE WHEN m.status = 'completed' THEN 1 END) as completed_matches,
        COUNT(CASE WHEN m.status = 'upcoming' THEN 1 END) as upcoming_matches,
        COUNT(CASE WHEN m.status = 'live' THEN 1 END) as live_matches,
        COUNT(DISTINCT m.series_id) as seasons_hosted,
        COUNT(DISTINCT CASE WHEN m.team1_id = t.team_id OR m.team2_id = t.team_id THEN t.team_id END) as unique_teams,
        AVG(CASE WHEN ts.total_runs IS NOT NULL THEN ts.total_runs END) as avg_first_innings_score,
        MAX(ts.total_runs) as highest_team_score,
        MIN(CASE WHEN ts.total_runs > 0 THEN ts.total_runs END) as lowest_team_score
      FROM matches m
      LEFT JOIN teams t ON (m.team1_id = t.team_id OR m.team2_id = t.team_id)
      LEFT JOIN team_stats ts ON m.match_id = ts.match_id AND ts.innings_number = 1
      WHERE m.stadium_id = ?
    `;

      const [stats] = await pool.execute<RowDataPacket[]>(statsQuery, [
         stadiumId,
      ]);

      // Get team performance at this stadium
      const teamPerformanceQuery = `
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
        ROUND(
          COUNT(CASE 
            WHEN (m.team1_id = t.team_id AND m.result LIKE CONCAT(t.team_name, '%'))
              OR (m.team2_id = t.team_id AND m.result LIKE CONCAT(t.team_name, '%'))
            THEN 1 
          END) * 100.0 / COUNT(*), 2
        ) as win_percentage
      FROM matches m
      JOIN teams t ON (m.team1_id = t.team_id OR m.team2_id = t.team_id)
      WHERE m.stadium_id = ? AND m.status = 'completed'
      GROUP BY t.team_id, t.team_name, t.team_code, t.primary_color
      HAVING matches_played > 0
      ORDER BY win_percentage DESC, matches_won DESC
    `;

      const [teamPerformance] = await pool.execute<RowDataPacket[]>(
         teamPerformanceQuery,
         [stadiumId]
      );

      // Get total count for pagination
      let countQuery =
         "SELECT COUNT(*) as total FROM matches m WHERE m.stadium_id = ?";
      let countParams: any[] = [stadiumId];

      if (season) {
         countQuery +=
            " AND EXISTS (SELECT 1 FROM series se WHERE m.series_id = se.series_id AND se.season = ?)";
         countParams.push(season);
      }
      if (status) {
         countQuery += " AND m.status = ?";
         countParams.push(status);
      }
      if (teamId) {
         const teamIdInt = parseInt(teamId);
         countQuery += " AND (m.team1_id = ? OR m.team2_id = ?)";
         countParams.push(teamIdInt, teamIdInt);
      }

      const [countResult] = await pool.execute<RowDataPacket[]>(
         countQuery,
         countParams
      );
      const totalCount =
         countResult && countResult.length > 0
            ? (countResult[0] as any).total
            : 0;

      return NextResponse.json({
         success: true,
         data: {
            stadium,
            matches: matches || [],
            statistics: stats && stats.length > 0 ? stats[0] : {},
            team_performance: teamPerformance || [],
            pagination: {
               total: totalCount,
               limit,
               offset,
               hasMore: totalCount > offset + limit,
            },
         },
      });
   } catch (error) {
      console.error("Error fetching stadium matches:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch stadium matches" },
         { status: 500 }
      );
   }
}
