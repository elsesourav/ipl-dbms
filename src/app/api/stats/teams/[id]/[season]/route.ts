import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string; season: string } }
) {
   try {
      const teamId = parseInt(params.id);
      const season = parseInt(params.season);

      if (isNaN(teamId) || isNaN(season)) {
         return NextResponse.json(
            { error: "Invalid team ID or season" },
            { status: 400 }
         );
      }

      // Get team information
      const [teamInfo] = await pool.execute(
         `SELECT * FROM teams WHERE team_id = ?`,
         [teamId]
      );

      if (!(teamInfo as any[]).length) {
         return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      const team = (teamInfo as any[])[0];

      // Get comprehensive team statistics for the season
      const [teamStats] = await pool.execute(
         `SELECT 
        COUNT(DISTINCT m.match_id) as matches_played,
        COUNT(CASE WHEN m.winning_team_id = ? THEN 1 END) as matches_won,
        COUNT(CASE WHEN m.winning_team_id != ? AND m.match_status = 'completed' THEN 1 END) as matches_lost,
        COUNT(CASE WHEN m.match_status = 'no_result' THEN 1 END) as no_results,
        ROUND(COUNT(CASE WHEN m.winning_team_id = ? THEN 1 END) * 100.0 / COUNT(DISTINCT m.match_id), 2) as win_percentage,
        
        -- Points calculation
        (COUNT(CASE WHEN m.winning_team_id = ? THEN 1 END) * 2 + 
         COUNT(CASE WHEN m.match_status = 'no_result' THEN 1 END)) as points,
        
        -- Batting stats
        AVG(CASE WHEN ts.team_id = ? THEN ts.total_score END) as avg_score,
        MAX(CASE WHEN ts.team_id = ? THEN ts.total_score END) as highest_score,
        MIN(CASE WHEN ts.team_id = ? THEN ts.total_score END) as lowest_score,
        SUM(CASE WHEN ts.team_id = ? THEN ts.total_score ELSE 0 END) as total_runs_scored,
        
        -- Bowling stats
        AVG(CASE WHEN ts.team_id != ? THEN ts.total_score END) as avg_runs_conceded,
        MIN(CASE WHEN ts.team_id != ? THEN ts.total_score END) as best_bowling_performance,
        SUM(CASE WHEN ts.team_id != ? THEN ts.total_score ELSE 0 END) as total_runs_conceded,
        
        -- Net Run Rate
        ROUND(
          (SUM(CASE WHEN ts.team_id = ? THEN ts.total_score ELSE 0 END) / 
           NULLIF(SUM(CASE WHEN ts.team_id = ? THEN ts.overs_faced ELSE 0 END), 0)) -
          (SUM(CASE WHEN ts.team_id != ? THEN ts.total_score ELSE 0 END) / 
           NULLIF(SUM(CASE WHEN ts.team_id != ? THEN ts.overs_faced ELSE 0 END), 0)), 3
        ) as net_run_rate
        
      FROM matches m
      LEFT JOIN team_stats ts ON m.match_id = ts.match_id
      WHERE (m.team1_id = ? OR m.team2_id = ?) AND m.season_year = ?`,
         [
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            season,
         ]
      );

      // Get match results breakdown
      const [matchResults] = await pool.execute(
         `SELECT 
        COUNT(CASE WHEN m.result_type = 'runs' AND m.winning_team_id = ? THEN 1 END) as wins_by_runs,
        COUNT(CASE WHEN m.result_type = 'wickets' AND m.winning_team_id = ? THEN 1 END) as wins_by_wickets,
        COUNT(CASE WHEN m.result_type = 'runs' AND m.winning_team_id != ? THEN 1 END) as losses_by_runs,
        COUNT(CASE WHEN m.result_type = 'wickets' AND m.winning_team_id != ? THEN 1 END) as losses_by_wickets,
        AVG(CASE WHEN m.result_type = 'runs' AND m.winning_team_id = ? THEN m.win_margin END) as avg_win_margin_runs,
        AVG(CASE WHEN m.result_type = 'wickets' AND m.winning_team_id = ? THEN m.win_margin END) as avg_win_margin_wickets
      FROM matches m
      WHERE (m.team1_id = ? OR m.team2_id = ?) AND m.season_year = ? AND m.match_status = 'completed'`,
         [
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            teamId,
            season,
         ]
      );

      // Get venue performance
      const [venuePerformance] = await pool.execute(
         `SELECT 
        s.stadium_id,
        s.name as stadium_name,
        s.city as stadium_city,
        COUNT(*) as matches_played,
        COUNT(CASE WHEN m.winning_team_id = ? THEN 1 END) as matches_won,
        ROUND(COUNT(CASE WHEN m.winning_team_id = ? THEN 1 END) * 100.0 / COUNT(*), 2) as win_percentage,
        AVG(CASE WHEN ts.team_id = ? THEN ts.total_score END) as avg_score
      FROM matches m
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      LEFT JOIN team_stats ts ON m.match_id = ts.match_id
      WHERE (m.team1_id = ? OR m.team2_id = ?) AND m.season_year = ?
      GROUP BY s.stadium_id, s.name, s.city
      ORDER BY matches_played DESC`,
         [teamId, teamId, teamId, teamId, teamId, season]
      );

      // Get top performers
      const [topBatsmen] = await pool.execute(
         `SELECT 
        p.player_id,
        p.name,
        p.jersey_number,
        SUM(bs.runs_scored) as total_runs,
        COUNT(DISTINCT m.match_id) as matches_played,
        ROUND(AVG(bs.runs_scored), 2) as avg_per_ball,
        SUM(CASE WHEN bs.runs_scored = 4 THEN 1 ELSE 0 END) as total_fours,
        SUM(CASE WHEN bs.runs_scored = 6 THEN 1 ELSE 0 END) as total_sixes
      FROM players p
      JOIN batting_scorecards bs ON p.player_id = bs.player_id
      JOIN matches m ON bs.match_id = m.match_id
      WHERE p.current_team_id = ? AND m.season_year = ?
      GROUP BY p.player_id, p.name, p.jersey_number
      ORDER BY total_runs DESC
      LIMIT 5`,
         [teamId, season]
      );

      const [topBowlers] = await pool.execute(
         `SELECT 
        p.player_id,
        p.name,
        p.jersey_number,
        SUM(bow.wickets_taken) as total_wickets,
        COUNT(DISTINCT m.match_id) as matches_played,
        SUM(bow.overs_bowled) as total_overs,
        SUM(bow.runs_conceded) as total_runs_conceded,
        ROUND(AVG(bow.economy_rate), 2) as avg_economy
      FROM players p
      JOIN bowling_scorecards bow ON p.player_id = bow.player_id
      JOIN matches m ON bow.match_id = m.match_id
      WHERE p.current_team_id = ? AND m.season_year = ?
      GROUP BY p.player_id, p.name, p.jersey_number
      ORDER BY total_wickets DESC
      LIMIT 5`,
         [teamId, season]
      );

      // Get recent matches
      const [recentMatches] = await pool.execute(
         `SELECT 
        m.*,
        opp.name as opponent_name,
        opp.short_name as opponent_short,
        s.name as stadium_name,
        wt.short_name as winning_team_short,
        ts1.total_score as team_score,
        ts2.total_score as opponent_score
      FROM matches m
      JOIN teams opp ON (CASE WHEN m.team1_id = ? THEN m.team2_id ELSE m.team1_id END) = opp.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      LEFT JOIN teams wt ON m.winning_team_id = wt.team_id
      LEFT JOIN team_stats ts1 ON m.match_id = ts1.match_id AND ts1.team_id = ?
      LEFT JOIN team_stats ts2 ON m.match_id = ts2.match_id AND ts2.team_id = opp.team_id
      WHERE (m.team1_id = ? OR m.team2_id = ?) AND m.season_year = ?
      ORDER BY m.match_date DESC
      LIMIT 5`,
         [teamId, teamId, teamId, teamId, season]
      );

      return NextResponse.json({
         success: true,
         data: {
            team,
            season,
            statistics: (teamStats as any[])[0],
            match_results: (matchResults as any[])[0],
            venue_performance: venuePerformance,
            top_performers: {
               batsmen: topBatsmen,
               bowlers: topBowlers,
            },
            recent_matches: recentMatches,
         },
      });
   } catch (error) {
      console.error("Error fetching team season stats:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
