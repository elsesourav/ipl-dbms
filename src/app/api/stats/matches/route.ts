import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";

// GET /api/stats/matches - Get match statistics
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const category = searchParams.get("category"); // 'results', 'venues', 'types', 'margins'
      const teamId = searchParams.get("teamId");
      const venueId = searchParams.get("venueId");

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

      // Overall match statistics
      const overallQuery = `
      SELECT 
        COUNT(*) as total_matches,
        COUNT(CASE WHEN match_status = 'completed' THEN 1 END) as completed_matches,
        COUNT(CASE WHEN match_status = 'live' THEN 1 END) as live_matches,
        COUNT(CASE WHEN match_status = 'scheduled' THEN 1 END) as upcoming_matches,
        COUNT(CASE WHEN match_status = 'abandoned' THEN 1 END) as abandoned_matches,
        
        -- Win types
        COUNT(CASE WHEN win_type = 'runs' THEN 1 END) as wins_by_runs,
        COUNT(CASE WHEN win_type = 'wickets' THEN 1 END) as wins_by_wickets,
        COUNT(CASE WHEN win_type = 'super_over' THEN 1 END) as super_over_matches,
        COUNT(CASE WHEN win_type = 'dls' THEN 1 END) as dls_matches,
        COUNT(CASE WHEN win_type = 'no_result' THEN 1 END) as no_result_matches,
        
        -- Special features
        COUNT(CASE WHEN super_over_required = TRUE THEN 1 END) as matches_with_super_over,
        COUNT(CASE WHEN impact_player_used_team1 = TRUE OR impact_player_used_team2 = TRUE THEN 1 END) as impact_player_matches,
        
        -- Averages
        AVG(CASE WHEN win_type = 'runs' THEN win_margin END) as avg_runs_margin,
        AVG(CASE WHEN win_type = 'wickets' THEN win_margin END) as avg_wickets_margin,
        
        -- Match types
        COUNT(CASE WHEN match_type = 'league' THEN 1 END) as league_matches,
        COUNT(CASE WHEN match_type = 'qualifier1' THEN 1 END) as qualifier1_matches,
        COUNT(CASE WHEN match_type = 'qualifier2' THEN 1 END) as qualifier2_matches,
        COUNT(CASE WHEN match_type = 'eliminator' THEN 1 END) as eliminator_matches,
        COUNT(CASE WHEN match_type = 'final' THEN 1 END) as final_matches
        
      FROM Matches 
      WHERE series_id = ?
    `;

      const params: any[] = [seriesId];
      let whereClause = "";

      if (teamId) {
         whereClause += " AND (team1_id = ? OR team2_id = ?)";
         params.push(parseInt(teamId), parseInt(teamId));
      }

      if (venueId) {
         whereClause += " AND stadium_id = ?";
         params.push(parseInt(venueId));
      }

      const [overallStats] = await pool.execute<RowDataPacket[]>(
         overallQuery + whereClause,
         params
      );

      stats.overall = overallStats[0];

      // Venue statistics
      if (!category || category === "venues") {
         const venueQuery = `
        SELECT 
          s.stadium_id,
          s.stadium_name,
          s.city,
          s.state,
          s.capacity,
          COUNT(m.match_id) as matches_hosted,
          COUNT(CASE WHEN m.is_completed = TRUE THEN 1 END) as completed_matches,
          
          -- Batting friendly vs bowling friendly
          AVG(CASE WHEN m.is_completed = TRUE THEN (
            SELECT SUM(runs_scored) FROM BattingScorecard WHERE match_id = m.match_id
          ) END) as avg_total_runs,
          
          AVG(CASE WHEN m.is_completed = TRUE THEN (
            SELECT COUNT(*) FROM BattingScorecard WHERE match_id = m.match_id AND is_out = TRUE
          ) END) as avg_total_wickets,
          
          -- Toss impact
          COUNT(CASE WHEN m.toss_winner_id = m.winner_id THEN 1 END) as toss_winner_also_won,
          COUNT(CASE WHEN m.toss_winner_id IS NOT NULL THEN 1 END) as matches_with_toss,
          
          -- Day/Night matches
          COUNT(CASE WHEN m.is_day_night = TRUE THEN 1 END) as day_night_matches,
          COUNT(CASE WHEN m.has_dew = TRUE THEN 1 END) as matches_with_dew
          
        FROM Stadiums s
        JOIN Matches m ON s.stadium_id = m.stadium_id
        WHERE m.series_id = ?${whereClause}
        GROUP BY s.stadium_id, s.stadium_name, s.city, s.state, s.capacity
        ORDER BY matches_hosted DESC
      `;

         const [venueStats] = await pool.execute<RowDataPacket[]>(
            venueQuery,
            params
         );
         stats.venues = venueStats;
      }

      // Result margins analysis
      if (!category || category === "margins") {
         const marginQuery = `
        SELECT 
          win_type,
          COUNT(*) as count,
          AVG(win_margin) as avg_margin,
          MIN(win_margin) as min_margin,
          MAX(win_margin) as max_margin,
          
          -- Distribution
          COUNT(CASE WHEN win_margin BETWEEN 1 AND 10 THEN 1 END) as margin_1_to_10,
          COUNT(CASE WHEN win_margin BETWEEN 11 AND 25 THEN 1 END) as margin_11_to_25,
          COUNT(CASE WHEN win_margin BETWEEN 26 AND 50 THEN 1 END) as margin_26_to_50,
          COUNT(CASE WHEN win_margin > 50 THEN 1 END) as margin_over_50
          
        FROM Matches
        WHERE series_id = ? AND is_completed = TRUE AND win_margin IS NOT NULL${whereClause}
        GROUP BY win_type
        ORDER BY count DESC
      `;

         const [marginStats] = await pool.execute<RowDataPacket[]>(
            marginQuery,
            params
         );
         stats.margins = marginStats;
      }

      // Match timing and conditions
      if (!category || category === "conditions") {
         const conditionsQuery = `
        SELECT 
          -- Weather impact
          weather_conditions,
          COUNT(*) as matches_count,
          COUNT(CASE WHEN winner_id IS NOT NULL THEN 1 END) as completed_count,
          
          -- Temperature ranges
          CASE 
            WHEN temperature_celsius < 25 THEN 'Cool (< 25°C)'
            WHEN temperature_celsius BETWEEN 25 AND 35 THEN 'Moderate (25-35°C)'
            WHEN temperature_celsius > 35 THEN 'Hot (> 35°C)'
            ELSE 'Unknown'
          END as temp_range,
          
          -- Humidity impact
          CASE 
            WHEN humidity_percent < 40 THEN 'Low (< 40%)'
            WHEN humidity_percent BETWEEN 40 AND 70 THEN 'Moderate (40-70%)'
            WHEN humidity_percent > 70 THEN 'High (> 70%)'
            ELSE 'Unknown'
          END as humidity_range
          
        FROM Matches
        WHERE series_id = ? AND weather_conditions IS NOT NULL${whereClause}
        GROUP BY weather_conditions, temp_range, humidity_range
        ORDER BY matches_count DESC
      `;

         const [conditionsStats] = await pool.execute<RowDataPacket[]>(
            conditionsQuery,
            params
         );
         stats.conditions = conditionsStats;
      }

      // Head-to-head records
      if (!category || category === "head_to_head") {
         const h2hQuery = `
        SELECT 
          t1.team_name as team1_name,
          t1.team_code as team1_code,
          t2.team_name as team2_name,
          t2.team_code as team2_code,
          COUNT(*) as total_matches,
          COUNT(CASE WHEN m.winner_id = t1.team_id THEN 1 END) as team1_wins,
          COUNT(CASE WHEN m.winner_id = t2.team_id THEN 1 END) as team2_wins,
          COUNT(CASE WHEN m.win_type = 'no_result' THEN 1 END) as no_results,
          
          -- Recent form (last 5 matches)
          (SELECT COUNT(*) 
           FROM Matches m2 
           WHERE ((m2.team1_id = t1.team_id AND m2.team2_id = t2.team_id) OR 
                  (m2.team1_id = t2.team_id AND m2.team2_id = t1.team_id))
           AND m2.series_id = m.series_id 
           AND m2.winner_id = t1.team_id 
           AND m2.match_date >= (
             SELECT MAX(match_date) - INTERVAL 365 DAY FROM Matches 
             WHERE series_id = m.series_id
           )
          ) as team1_recent_wins
          
        FROM Matches m
        JOIN Teams t1 ON m.team1_id = t1.team_id
        JOIN Teams t2 ON m.team2_id = t2.team_id
        WHERE m.series_id = ?${whereClause}
        GROUP BY t1.team_id, t1.team_name, t1.team_code, t2.team_id, t2.team_name, t2.team_code
        HAVING total_matches > 0
        ORDER BY total_matches DESC
        LIMIT 20
      `;

         const [h2hStats] = await pool.execute<RowDataPacket[]>(
            h2hQuery,
            params
         );
         stats.head_to_head = h2hStats;
      }

      return NextResponse.json({
         success: true,
         season: currentSeason,
         filters: { category, teamId, venueId },
         data: stats,
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch match statistics",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
