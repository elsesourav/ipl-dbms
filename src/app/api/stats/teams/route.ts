import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";

// GET /api/stats/teams - Get team statistics
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const sortBy = searchParams.get("sortBy") || "points"; // points, nrr, wins, matches
      const limit = parseInt(searchParams.get("limit") || "10");

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

      // Get comprehensive team statistics
      let teamStatsQuery = `
      SELECT 
        t.team_id,
        t.team_name,
        t.team_code,
        t.team_color,
        t.city,
        t.owner,
        t.coach,
        ts.matches_played,
        ts.matches_won,
        ts.matches_lost,
        ts.no_results,
        ts.points,
        ts.net_run_rate,
        CASE WHEN ts.matches_played > 0 THEN ROUND((ts.matches_won * 100.0 / ts.matches_played), 2) ELSE 0 END as win_percentage,
        
        -- Batting stats aggregated from scorecards
        COALESCE(bat_stats.total_runs, 0) as total_runs_scored,
        COALESCE(bat_stats.total_balls, 0) as total_balls_faced,
        COALESCE(bat_stats.total_fours, 0) as total_fours,
        COALESCE(bat_stats.total_sixes, 0) as total_sixes,
        COALESCE(bat_stats.highest_total, 0) as highest_team_total,
        CASE WHEN bat_stats.total_balls > 0 THEN ROUND((bat_stats.total_runs * 100.0 / bat_stats.total_balls), 2) ELSE 0 END as team_strike_rate,
        
        -- Bowling stats aggregated from scorecards
        COALESCE(bowl_stats.total_wickets, 0) as total_wickets_taken,
        COALESCE(bowl_stats.total_runs_conceded, 0) as total_runs_conceded,
        COALESCE(bowl_stats.total_overs, 0) as total_overs_bowled,
        CASE WHEN bowl_stats.total_overs > 0 THEN ROUND((bowl_stats.total_runs_conceded / bowl_stats.total_overs), 2) ELSE 0 END as team_economy_rate,
        
        -- Home vs Away record
        home_stats.home_wins,
        home_stats.home_matches,
        away_stats.away_wins,
        away_stats.away_matches
        
      FROM Teams t
      JOIN TeamStats ts ON t.team_id = ts.team_id
      
      -- Batting statistics
      LEFT JOIN (
        SELECT 
          bs.team_id,
          SUM(bs.runs_scored) as total_runs,
          SUM(bs.balls_faced) as total_balls,
          SUM(bs.fours) as total_fours,
          SUM(bs.sixes) as total_sixes,
          MAX(team_total.runs) as highest_total
        FROM BattingScorecard bs
        JOIN Matches m ON bs.match_id = m.match_id
        LEFT JOIN (
          SELECT 
            match_id, 
            team_id, 
            SUM(runs_scored) as runs
          FROM BattingScorecard 
          GROUP BY match_id, team_id
        ) team_total ON bs.match_id = team_total.match_id AND bs.team_id = team_total.team_id
        WHERE m.series_id = ?
        GROUP BY bs.team_id
      ) bat_stats ON t.team_id = bat_stats.team_id
      
      -- Bowling statistics  
      LEFT JOIN (
        SELECT 
          bow.team_id,
          SUM(bow.wickets_taken) as total_wickets,
          SUM(bow.runs_conceded) as total_runs_conceded,
          SUM(bow.overs_bowled) as total_overs
        FROM BowlingScorecard bow
        JOIN Matches m ON bow.match_id = m.match_id
        WHERE m.series_id = ?
        GROUP BY bow.team_id
      ) bowl_stats ON t.team_id = bowl_stats.team_id
      
      -- Home match statistics
      LEFT JOIN (
        SELECT 
          t_home.team_id,
          COUNT(CASE WHEN m.winner_id = t_home.team_id THEN 1 END) as home_wins,
          COUNT(*) as home_matches
        FROM Teams t_home
        JOIN Matches m ON t_home.home_ground = m.stadium_id  -- Assuming home ground matches stadium
        WHERE m.series_id = ? AND (m.team1_id = t_home.team_id OR m.team2_id = t_home.team_id)
        GROUP BY t_home.team_id
      ) home_stats ON t.team_id = home_stats.team_id
      
      -- Away match statistics  
      LEFT JOIN (
        SELECT 
          t_away.team_id,
          COUNT(CASE WHEN m.winner_id = t_away.team_id THEN 1 END) as away_wins,
          COUNT(*) as away_matches
        FROM Teams t_away
        JOIN Matches m ON t_away.home_ground != m.stadium_id  -- Away matches
        WHERE m.series_id = ? AND (m.team1_id = t_away.team_id OR m.team2_id = t_away.team_id)
        GROUP BY t_away.team_id
      ) away_stats ON t.team_id = away_stats.team_id
      
      WHERE ts.series_id = ? AND t.is_active = TRUE
    `;

      // Add sorting
      if (sortBy === "points") {
         teamStatsQuery += " ORDER BY ts.points DESC, ts.net_run_rate DESC";
      } else if (sortBy === "nrr") {
         teamStatsQuery += " ORDER BY ts.net_run_rate DESC";
      } else if (sortBy === "wins") {
         teamStatsQuery += " ORDER BY ts.matches_won DESC, ts.points DESC";
      } else if (sortBy === "matches") {
         teamStatsQuery += " ORDER BY ts.matches_played DESC";
      } else if (sortBy === "runs") {
         teamStatsQuery += " ORDER BY total_runs_scored DESC";
      } else if (sortBy === "wickets") {
         teamStatsQuery += " ORDER BY total_wickets_taken DESC";
      } else {
         teamStatsQuery += " ORDER BY ts.points DESC, ts.net_run_rate DESC";
      }

      teamStatsQuery += " LIMIT ?";

      const [teamStats] = await pool.execute<RowDataPacket[]>(teamStatsQuery, [
         seriesId,
         seriesId,
         seriesId,
         seriesId,
         seriesId,
         limit,
      ]);

      // Get summary statistics
      const summaryQuery = `
      SELECT 
        COUNT(*) as total_teams,
        AVG(ts.matches_played) as avg_matches_per_team,
        SUM(ts.matches_won) as total_wins,
        SUM(ts.matches_lost) as total_losses,
        AVG(ts.net_run_rate) as avg_net_run_rate,
        MAX(ts.points) as highest_points,
        MIN(ts.points) as lowest_points
      FROM TeamStats ts
      JOIN Teams t ON ts.team_id = t.team_id
      WHERE ts.series_id = ? AND t.is_active = TRUE
    `;

      const [summary] = await pool.execute<RowDataPacket[]>(summaryQuery, [
         seriesId,
      ]);

      return NextResponse.json({
         success: true,
         season: currentSeason,
         filters: { sortBy, limit },
         summary: summary[0],
         data: teamStats,
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch team statistics",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
