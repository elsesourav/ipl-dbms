import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/stats - Get general stats overview
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const category = searchParams.get("category"); // 'player', 'team', 'match', 'season'
      const season = searchParams.get("season");
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

      const stats: any = {};

      // Player statistics
      if (!category || category === "player") {
         // Top run scorers
         const topBatsmenQuery = `
        SELECT 
          p.player_id,
          p.player_name,
          p.role,
          t.team_name,
          t.team_code,
          ps.runs_scored,
          ps.matches_played,
          ps.highest_score,
          ps.balls_faced,
          ps.fours,
          ps.sixes,
          ps.fifties,
          ps.hundreds,
          CASE WHEN ps.balls_faced > 0 THEN ROUND((ps.runs_scored * 100.0 / ps.balls_faced), 2) ELSE 0 END as strike_rate,
          CASE WHEN ps.matches_played > 0 THEN ROUND(ps.runs_scored / ps.matches_played, 2) ELSE 0 END as average
        FROM Players p
        JOIN PlayerStats ps ON p.player_id = ps.player_id
        JOIN PlayerContracts pc ON p.player_id = pc.player_id AND pc.series_id = ps.series_id
        JOIN Teams t ON pc.team_id = t.team_id
        WHERE ps.series_id = (SELECT series_id FROM Series WHERE season_year = ?)
        ORDER BY ps.runs_scored DESC
        LIMIT ?
      `;

         // Top wicket takers
         const topBowlersQuery = `
        SELECT 
          p.player_id,
          p.player_name,
          p.role,
          t.team_name,
          t.team_code,
          ps.wickets_taken,
          ps.matches_played,
          ps.overs_bowled,
          ps.runs_conceded,
          ps.best_bowling,
          CASE WHEN ps.overs_bowled > 0 THEN ROUND(ps.runs_conceded / ps.overs_bowled, 2) ELSE 0 END as economy_rate,
          CASE WHEN ps.wickets_taken > 0 THEN ROUND(ps.runs_conceded / ps.wickets_taken, 2) ELSE 0 END as average
        FROM Players p
        JOIN PlayerStats ps ON p.player_id = ps.player_id
        JOIN PlayerContracts pc ON p.player_id = pc.player_id AND pc.series_id = ps.series_id
        JOIN Teams t ON pc.team_id = t.team_id
        WHERE ps.series_id = (SELECT series_id FROM Series WHERE season_year = ?)
        AND ps.wickets_taken > 0
        ORDER BY ps.wickets_taken DESC, economy_rate ASC
        LIMIT ?
      `;

         // Most sixes
         const mostSixesQuery = `
        SELECT 
          p.player_id,
          p.player_name,
          t.team_name,
          t.team_code,
          ps.sixes,
          ps.matches_played,
          ps.runs_scored
        FROM Players p
        JOIN PlayerStats ps ON p.player_id = ps.player_id
        JOIN PlayerContracts pc ON p.player_id = pc.player_id AND pc.series_id = ps.series_id
        JOIN Teams t ON pc.team_id = t.team_id
        WHERE ps.series_id = (SELECT series_id FROM Series WHERE season_year = ?)
        AND ps.sixes > 0
        ORDER BY ps.sixes DESC
        LIMIT ?
      `;

         const [topBatsmen] = await pool.execute<RowDataPacket[]>(
            topBatsmenQuery,
            [currentSeason, limit]
         );
         const [topBowlers] = await pool.execute<RowDataPacket[]>(
            topBowlersQuery,
            [currentSeason, limit]
         );
         const [mostSixes] = await pool.execute<RowDataPacket[]>(
            mostSixesQuery,
            [currentSeason, limit]
         );

         stats.players = {
            top_run_scorers: topBatsmen,
            top_wicket_takers: topBowlers,
            most_sixes: mostSixes,
         };
      }

      // Team statistics
      if (!category || category === "team") {
         const teamStatsQuery = `
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
          ts.net_run_rate,
          CASE WHEN ts.matches_played > 0 THEN ROUND((ts.matches_won * 100.0 / ts.matches_played), 2) ELSE 0 END as win_percentage
        FROM Teams t
        JOIN TeamStats ts ON t.team_id = ts.team_id
        WHERE ts.series_id = (SELECT series_id FROM Series WHERE season_year = ?)
        AND t.is_active = TRUE
        ORDER BY ts.points DESC, ts.net_run_rate DESC
      `;

         const [teamStats] = await pool.execute<RowDataPacket[]>(
            teamStatsQuery,
            [currentSeason]
         );
         stats.teams = teamStats;
      }

      // Match statistics
      if (!category || category === "match") {
         const matchStatsQuery = `
        SELECT 
          COUNT(*) as total_matches,
          COUNT(CASE WHEN match_status = 'completed' THEN 1 END) as completed_matches,
          COUNT(CASE WHEN win_type = 'runs' THEN 1 END) as wins_by_runs,
          COUNT(CASE WHEN win_type = 'wickets' THEN 1 END) as wins_by_wickets,
          COUNT(CASE WHEN win_type = 'super_over' THEN 1 END) as super_over_matches,
          COUNT(CASE WHEN win_type = 'dls' THEN 1 END) as dls_matches,
          COUNT(CASE WHEN impact_player_used_team1 = TRUE OR impact_player_used_team2 = TRUE THEN 1 END) as impact_player_used,
          AVG(CASE WHEN win_type = 'runs' THEN win_margin END) as avg_runs_margin,
          AVG(CASE WHEN win_type = 'wickets' THEN win_margin END) as avg_wickets_margin
        FROM Matches m
        WHERE m.series_id = (SELECT series_id FROM Series WHERE season_year = ?)
      `;

         const [matchStats] = await pool.execute<RowDataPacket[]>(
            matchStatsQuery,
            [currentSeason]
         );

         // Venue statistics
         const venueStatsQuery = `
        SELECT 
          s.stadium_id,
          s.stadium_name,
          s.city,
          COUNT(m.match_id) as matches_hosted,
          COUNT(CASE WHEN m.is_completed = TRUE THEN 1 END) as completed_matches,
          AVG(CASE WHEN m.is_completed = TRUE THEN 
            (SELECT SUM(runs_scored) FROM BattingScorecard WHERE match_id = m.match_id)
          END) as avg_total_runs
        FROM Stadiums s
        JOIN Matches m ON s.stadium_id = m.stadium_id
        WHERE m.series_id = (SELECT series_id FROM Series WHERE season_year = ?)
        GROUP BY s.stadium_id, s.stadium_name, s.city
        ORDER BY matches_hosted DESC
        LIMIT ?
      `;

         const [venueStats] = await pool.execute<RowDataPacket[]>(
            venueStatsQuery,
            [currentSeason, limit]
         );

         stats.matches = {
            overview: matchStats[0],
            venues: venueStats,
         };
      }

      // Season overview
      if (!category || category === "season") {
         const seasonStatsQuery = `
        SELECT 
          s.series_id,
          s.series_name,
          s.season_year,
          s.start_date,
          s.end_date,
          s.num_teams,
          s.total_matches,
          s.is_completed,
          COUNT(DISTINCT m.match_id) as matches_scheduled,
          COUNT(DISTINCT CASE WHEN m.is_completed = TRUE THEN m.match_id END) as matches_completed,
          COUNT(DISTINCT pc.player_id) as total_players,
          COUNT(DISTINCT pc.team_id) as participating_teams
        FROM Series s
        LEFT JOIN Matches m ON s.series_id = m.series_id
        LEFT JOIN PlayerContracts pc ON s.series_id = pc.series_id
        WHERE s.season_year = ?
        GROUP BY s.series_id, s.series_name, s.season_year, s.start_date, s.end_date, 
                 s.num_teams, s.total_matches, s.is_completed
      `;

         const [seasonStats] = await pool.execute<RowDataPacket[]>(
            seasonStatsQuery,
            [currentSeason]
         );
         stats.season = seasonStats[0];
      }

      return NextResponse.json({
         success: true,
         season: currentSeason,
         category: category || "all",
         data: stats,
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch statistics",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
