import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";

// GET /api/dashboard - Get dashboard overview
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");

      // Get current season if not specified
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

      // Get current series info
      const seriesQuery = `
      SELECT 
        series_id,
        series_name,
        season_year,
        start_date,
        end_date,
        num_teams,
        total_matches,
        is_completed,
        CASE 
          WHEN start_date > CURDATE() THEN 'upcoming'
          WHEN end_date < CURDATE() OR is_completed = TRUE THEN 'completed'
          ELSE 'ongoing'
        END as status
      FROM Series 
      WHERE season_year = ?
    `;
      const [seriesInfo] = await pool.execute<RowDataPacket[]>(seriesQuery, [
         currentSeason,
      ]);

      if (seriesInfo.length === 0) {
         return NextResponse.json(
            {
               success: false,
               error: "Season not found",
            },
            { status: 404 }
         );
      }

      const series = seriesInfo[0];

      // Get match statistics
      const matchStatsQuery = `
      SELECT 
        COUNT(*) as total_matches,
        COUNT(CASE WHEN match_status = 'completed' THEN 1 END) as completed_matches,
        COUNT(CASE WHEN match_status = 'live' THEN 1 END) as live_matches,
        COUNT(CASE WHEN match_status = 'scheduled' THEN 1 END) as upcoming_matches,
        COUNT(CASE WHEN super_over_required = TRUE THEN 1 END) as super_over_matches,
        COUNT(CASE WHEN impact_player_used_team1 = TRUE OR impact_player_used_team2 = TRUE THEN 1 END) as impact_player_matches
      FROM Matches 
      WHERE series_id = ?
    `;

      // Get team standings (top 4)
      const standingsQuery = `
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
      JOIN TeamStats ts ON t.team_id = ts.team_id
      WHERE ts.series_id = ? AND t.is_active = TRUE
      ORDER BY ts.points DESC, ts.net_run_rate DESC
      LIMIT 4
    `;

      // Get recent matches
      const recentMatchesQuery = `
      SELECT 
        m.match_id,
        m.match_number,
        m.match_date,
        m.match_time,
        m.match_status,
        m.match_type,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        w.team_name as winner_name,
        w.team_code as winner_code,
        m.win_type,
        m.win_margin,
        st.stadium_name,
        st.city,
        mom.player_name as man_of_match
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Stadiums st ON m.stadium_id = st.stadium_id
      LEFT JOIN Teams w ON m.winner_id = w.team_id
      LEFT JOIN Players mom ON m.man_of_match_id = mom.player_id
      WHERE m.series_id = ?
      ORDER BY m.match_date DESC, m.match_time DESC
      LIMIT 5
    `;

      // Get top performers
      const topBatsmenQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        t.team_name,
        t.team_code,
        ps.runs_scored,
        ps.matches_played,
        ps.highest_score,
        ps.fifties + ps.hundreds as milestones,
        CASE WHEN ps.balls_faced > 0 THEN ROUND((ps.runs_scored * 100.0 / ps.balls_faced), 2) ELSE 0 END as strike_rate
      FROM Players p
      JOIN PlayerStats ps ON p.player_id = ps.player_id
      JOIN PlayerContracts pc ON p.player_id = pc.player_id AND pc.series_id = ps.series_id
      JOIN Teams t ON pc.team_id = t.team_id
      WHERE ps.series_id = ? AND ps.runs_scored > 0
      ORDER BY ps.runs_scored DESC
      LIMIT 5
    `;

      const topBowlersQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        t.team_name,
        t.team_code,
        ps.wickets_taken,
        ps.matches_played,
        ps.best_bowling,
        CASE WHEN ps.overs_bowled > 0 THEN ROUND((ps.runs_conceded / ps.overs_bowled), 2) ELSE 0 END as economy_rate
      FROM Players p
      JOIN PlayerStats ps ON p.player_id = ps.player_id
      JOIN PlayerContracts pc ON p.player_id = pc.player_id AND pc.series_id = ps.series_id
      JOIN Teams t ON pc.team_id = t.team_id
      WHERE ps.series_id = ? AND ps.wickets_taken > 0
      ORDER BY ps.wickets_taken DESC, economy_rate ASC
      LIMIT 5
    `;

      // Execute all queries
      const [matchStats] = await pool.execute<RowDataPacket[]>(
         matchStatsQuery,
         [series.series_id]
      );
      const [standings] = await pool.execute<RowDataPacket[]>(standingsQuery, [
         series.series_id,
      ]);
      const [recentMatches] = await pool.execute<RowDataPacket[]>(
         recentMatchesQuery,
         [series.series_id]
      );
      const [topBatsmen] = await pool.execute<RowDataPacket[]>(
         topBatsmenQuery,
         [series.series_id]
      );
      const [topBowlers] = await pool.execute<RowDataPacket[]>(
         topBowlersQuery,
         [series.series_id]
      );

      // Get upcoming matches
      const upcomingMatchesQuery = `
      SELECT 
        m.match_id,
        m.match_number,
        m.match_date,
        m.match_time,
        m.match_type,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        st.stadium_name,
        st.city
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Stadiums st ON m.stadium_id = st.stadium_id
      WHERE m.series_id = ? AND m.match_status = 'scheduled'
      ORDER BY m.match_date ASC, m.match_time ASC
      LIMIT 5
    `;

      const [upcomingMatches] = await pool.execute<RowDataPacket[]>(
         upcomingMatchesQuery,
         [series.series_id]
      );

      return NextResponse.json({
         success: true,
         data: {
            season: {
               ...series,
               season_year: currentSeason,
            },
            statistics: {
               matches: matchStats[0],
               total_teams: series.num_teams,
               total_players: standings.length > 0 ? standings.length * 25 : 0, // Approximate
            },
            standings: standings,
            recent_matches: recentMatches,
            upcoming_matches: upcomingMatches,
            top_performers: {
               batsmen: topBatsmen,
               bowlers: topBowlers,
            },
         },
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch dashboard data",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
