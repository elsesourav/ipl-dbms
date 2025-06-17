import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";

// GET /api/matches/stats - Get aggregated match statistics
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const category = searchParams.get("category"); // 'overview', 'venues', 'teams', 'results'
      const teamId = searchParams.get("team_id");

      let whereClause = "WHERE m.status = 'completed'";
      let queryParams: any[] = [];

      if (season) {
         whereClause += " AND se.season = ?";
         queryParams.push(season);
      }

      if (teamId) {
         const teamIdInt = parseInt(teamId);
         whereClause += " AND (m.team1_id = ? OR m.team2_id = ?)";
         queryParams.push(teamIdInt, teamIdInt);
      }

      let responseData: any = {};

      // Overview statistics
      if (!category || category === "overview") {
         const overviewQuery = `
        SELECT 
          COUNT(*) as total_matches,
          COUNT(CASE WHEN m.margin_type = 'runs' THEN 1 END) as wins_by_runs,
          COUNT(CASE WHEN m.margin_type = 'wickets' THEN 1 END) as wins_by_wickets,
          COUNT(CASE WHEN m.result = 'No Result' THEN 1 END) as no_results,
          COUNT(CASE WHEN m.super_over_required = true THEN 1 END) as super_overs,
          AVG(ts.total_runs) as avg_first_innings_score,
          MAX(ts.total_runs) as highest_team_score,
          MIN(CASE WHEN ts.total_runs > 0 THEN ts.total_runs END) as lowest_team_score,
          AVG(CASE WHEN m.margin_type = 'runs' THEN m.margin_value END) as avg_victory_margin_runs,
          AVG(CASE WHEN m.margin_type = 'wickets' THEN m.margin_value END) as avg_victory_margin_wickets,
          COUNT(DISTINCT m.stadium_id) as venues_used,
          COUNT(DISTINCT CASE WHEN m.team1_id = t.team_id OR m.team2_id = t.team_id THEN t.team_id END) as teams_participated
        FROM matches m
        LEFT JOIN series se ON m.series_id = se.series_id
        LEFT JOIN team_stats ts ON m.match_id = ts.match_id AND ts.innings_number = 1
        LEFT JOIN teams t ON (m.team1_id = t.team_id OR m.team2_id = t.team_id)
        ${whereClause}
      `;

         const [overview] = await pool.execute<RowDataPacket[]>(
            overviewQuery,
            queryParams
         );
         responseData.overview =
            overview && overview.length > 0 ? overview[0] : {};
      }

      // Venue statistics
      if (!category || category === "venues") {
         const venueQuery = `
        SELECT 
          s.stadium_id,
          s.stadium_name,
          s.city,
          s.state,
          COUNT(*) as matches_played,
          AVG(ts.total_runs) as avg_first_innings_score,
          MAX(ts.total_runs) as highest_score,
          MIN(CASE WHEN ts.total_runs > 0 THEN ts.total_runs END) as lowest_score,
          COUNT(CASE WHEN m.margin_type = 'runs' THEN 1 END) as wins_by_runs,
          COUNT(CASE WHEN m.margin_type = 'wickets' THEN 1 END) as wins_by_wickets,
          COUNT(CASE WHEN m.toss_decision = 'bat' AND m.toss_winner_id = CASE 
            WHEN m.result LIKE CONCAT((SELECT team_name FROM teams WHERE team_id = m.toss_winner_id), '%') 
            THEN m.toss_winner_id ELSE 0 END THEN 1 END) as toss_bat_wins,
          COUNT(CASE WHEN m.toss_decision = 'bowl' AND m.toss_winner_id = CASE 
            WHEN m.result LIKE CONCAT((SELECT team_name FROM teams WHERE team_id = m.toss_winner_id), '%') 
            THEN m.toss_winner_id ELSE 0 END THEN 1 END) as toss_bowl_wins
        FROM matches m
        JOIN stadiums s ON m.stadium_id = s.stadium_id
        LEFT JOIN series se ON m.series_id = se.series_id
        LEFT JOIN team_stats ts ON m.match_id = ts.match_id AND ts.innings_number = 1
        ${whereClause}
        GROUP BY s.stadium_id, s.stadium_name, s.city, s.state
        HAVING matches_played > 0
        ORDER BY matches_played DESC
      `;

         const [venues] = await pool.execute<RowDataPacket[]>(
            venueQuery,
            queryParams
         );
         responseData.venues = venues || [];
      }

      // Team performance
      if (!category || category === "teams") {
         const teamQuery = `
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
          ) as win_percentage,
          AVG(CASE WHEN ts1.team_id = t.team_id THEN ts1.total_runs END) as avg_runs_scored,
          AVG(CASE WHEN ts2.team_id != t.team_id THEN ts2.total_runs END) as avg_runs_conceded
        FROM matches m
        JOIN teams t ON (m.team1_id = t.team_id OR m.team2_id = t.team_id)
        LEFT JOIN series se ON m.series_id = se.series_id
        LEFT JOIN team_stats ts1 ON m.match_id = ts1.match_id AND ts1.team_id = t.team_id
        LEFT JOIN team_stats ts2 ON m.match_id = ts2.match_id AND ts2.team_id != t.team_id
        ${whereClause}
        GROUP BY t.team_id, t.team_name, t.team_code, t.primary_color
        HAVING matches_played > 0
        ORDER BY win_percentage DESC, matches_won DESC
      `;

         const [teams] = await pool.execute<RowDataPacket[]>(
            teamQuery,
            queryParams
         );
         responseData.teams = teams || [];
      }

      // Results breakdown
      if (!category || category === "results") {
         const resultsQuery = `
        SELECT 
          m.margin_type,
          COUNT(*) as count,
          AVG(m.margin_value) as avg_margin,
          MAX(m.margin_value) as max_margin,
          MIN(m.margin_value) as min_margin,
          ROUND(COUNT(*) * 100.0 / (
            SELECT COUNT(*) FROM matches m2 
            LEFT JOIN series se2 ON m2.series_id = se2.series_id 
            WHERE m2.status = 'completed' AND m2.result != 'No Result'
            ${season ? "AND se2.season = ?" : ""}
          ), 2) as percentage
        FROM matches m
        LEFT JOIN series se ON m.series_id = se.series_id
        ${whereClause} AND m.result != 'No Result'
        GROUP BY m.margin_type
        ORDER BY count DESC
      `;

         const resultsParams = season ? [...queryParams, season] : queryParams;
         const [results] = await pool.execute<RowDataPacket[]>(
            resultsQuery,
            resultsParams
         );
         responseData.results = results || [];
      }

      // Toss impact
      const tossQuery = `
      SELECT 
        m.toss_decision,
        COUNT(*) as total_tosses,
        COUNT(CASE 
          WHEN m.result LIKE CONCAT((SELECT team_name FROM teams WHERE team_id = m.toss_winner_id), '%')
          THEN 1 
        END) as toss_wins,
        ROUND(
          COUNT(CASE 
            WHEN m.result LIKE CONCAT((SELECT team_name FROM teams WHERE team_id = m.toss_winner_id), '%')
            THEN 1 
          END) * 100.0 / COUNT(*), 2
        ) as win_percentage
      FROM matches m
      LEFT JOIN series se ON m.series_id = se.series_id
      ${whereClause} AND m.toss_winner_id IS NOT NULL AND m.result != 'No Result'
      GROUP BY m.toss_decision
      ORDER BY m.toss_decision
    `;

      const [tossImpact] = await pool.execute<RowDataPacket[]>(
         tossQuery,
         queryParams
      );
      responseData.toss_impact = tossImpact || [];

      return NextResponse.json({
         success: true,
         data: responseData,
      });
   } catch (error) {
      console.error("Error fetching match statistics:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch match statistics" },
         { status: 500 }
      );
   }
}
