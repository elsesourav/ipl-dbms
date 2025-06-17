import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { stadiumId: string } }
) {
   try {
      const stadiumId = parseInt(params.stadiumId);
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");

      if (isNaN(stadiumId)) {
         return NextResponse.json(
            { error: "Invalid stadium ID" },
            { status: 400 }
         );
      }

      // Get stadium information
      const [stadiumInfo] = await pool.execute(
         `SELECT * FROM stadiums WHERE stadium_id = ?`,
         [stadiumId]
      );

      if (!(stadiumInfo as any[]).length) {
         return NextResponse.json(
            { error: "Stadium not found" },
            { status: 404 }
         );
      }

      const stadium = (stadiumInfo as any[])[0];

      // Build season filter
      const seasonFilter = season
         ? `AND m.season_year = ${parseInt(season)}`
         : "";
      const seasonParams = season ? [stadiumId, parseInt(season)] : [stadiumId];

      // Get overall venue statistics
      const [venueStats] = await pool.execute(
         `SELECT 
        COUNT(DISTINCT m.match_id) as total_matches,
        COUNT(DISTINCT m.season_year) as seasons_hosted,
        COUNT(CASE WHEN m.match_status = 'completed' THEN 1 END) as completed_matches,
        COUNT(CASE WHEN m.match_status = 'no_result' THEN 1 END) as no_result_matches,
        AVG(ts.total_score) as average_score,
        MAX(ts.total_score) as highest_score,
        MIN(ts.total_score) as lowest_score,
        
        -- Toss statistics
        COUNT(CASE WHEN m.toss_decision = 'bat' THEN 1 END) as toss_bat_decisions,
        COUNT(CASE WHEN m.toss_decision = 'bowl' THEN 1 END) as toss_bowl_decisions,
        
        -- Result patterns
        COUNT(CASE WHEN m.result_type = 'runs' THEN 1 END) as wins_by_runs,
        COUNT(CASE WHEN m.result_type = 'wickets' THEN 1 END) as wins_by_wickets,
        AVG(CASE WHEN m.result_type = 'runs' THEN m.win_margin END) as avg_win_margin_runs,
        AVG(CASE WHEN m.result_type = 'wickets' THEN m.win_margin END) as avg_win_margin_wickets
        
      FROM matches m
      LEFT JOIN team_stats ts ON m.match_id = ts.match_id
      WHERE m.stadium_id = ? ${seasonFilter}`,
         seasonParams
      );

      // Get team performance at this venue
      const [teamPerformance] = await pool.execute(
         `SELECT 
        t.team_id,
        t.name as team_name,
        t.short_name,
        COUNT(DISTINCT m.match_id) as matches_played,
        COUNT(CASE WHEN m.winning_team_id = t.team_id THEN 1 END) as matches_won,
        ROUND(COUNT(CASE WHEN m.winning_team_id = t.team_id THEN 1 END) * 100.0 / COUNT(DISTINCT m.match_id), 2) as win_percentage,
        AVG(CASE WHEN ts.team_id = t.team_id THEN ts.total_score END) as avg_score_at_venue,
        MAX(CASE WHEN ts.team_id = t.team_id THEN ts.total_score END) as highest_score_at_venue
      FROM teams t
      JOIN matches m ON (t.team_id = m.team1_id OR t.team_id = m.team2_id)
      LEFT JOIN team_stats ts ON m.match_id = ts.match_id
      WHERE m.stadium_id = ? ${seasonFilter}
      GROUP BY t.team_id, t.name, t.short_name
      HAVING matches_played > 0
      ORDER BY win_percentage DESC`,
         seasonParams
      );

      // Get batting statistics at this venue
      const [battingStats] = await pool.execute(
         `SELECT 
        COUNT(CASE WHEN ts.total_score >= 200 THEN 1 END) as scores_200_plus,
        COUNT(CASE WHEN ts.total_score >= 180 THEN 1 END) as scores_180_plus,
        COUNT(CASE WHEN ts.total_score < 120 THEN 1 END) as scores_under_120,
        SUM(bs.runs_scored) as total_runs,
        SUM(CASE WHEN bs.runs_scored = 4 THEN 1 ELSE 0 END) as total_fours,
        SUM(CASE WHEN bs.runs_scored = 6 THEN 1 ELSE 0 END) as total_sixes,
        ROUND(SUM(CASE WHEN bs.runs_scored = 6 THEN 1 ELSE 0 END) * 100.0 / COUNT(bs.ball_id), 2) as six_percentage,
        ROUND(AVG(ts.total_score), 2) as average_team_score
      FROM matches m
      LEFT JOIN team_stats ts ON m.match_id = ts.match_id
      LEFT JOIN batting_scorecards bs ON m.match_id = bs.match_id
      WHERE m.stadium_id = ? ${seasonFilter}`,
         seasonParams
      );

      // Get bowling statistics at this venue
      const [bowlingStats] = await pool.execute(
         `SELECT 
        SUM(bow.wickets_taken) as total_wickets,
        ROUND(AVG(bow.economy_rate), 2) as average_economy_rate,
        SUM(bow.overs_bowled) as total_overs_bowled,
        SUM(bow.runs_conceded) as total_runs_conceded,
        COUNT(CASE WHEN bow.wickets_taken >= 4 THEN 1 END) as four_wicket_hauls,
        COUNT(CASE WHEN bow.wickets_taken >= 5 THEN 1 END) as five_wicket_hauls
      FROM matches m
      JOIN bowling_scorecards bow ON m.match_id = bow.match_id
      WHERE m.stadium_id = ? ${seasonFilter}`,
         seasonParams
      );

      // Get highest individual scores at this venue
      const [topScores] = await pool.execute(
         `SELECT 
        p.name as player_name,
        t.short_name as team_short,
        individual_scores.runs as individual_score,
        individual_scores.balls_faced,
        individual_scores.fours,
        individual_scores.sixes,
        m.match_date,
        CONCAT(t1.short_name, ' vs ', t2.short_name) as match_title
      FROM (
        SELECT 
          bs.player_id,
          bs.match_id,
          bs.innings_number,
          SUM(bs.runs_scored) as runs,
          COUNT(bs.ball_id) as balls_faced,
          SUM(CASE WHEN bs.runs_scored = 4 THEN 1 ELSE 0 END) as fours,
          SUM(CASE WHEN bs.runs_scored = 6 THEN 1 ELSE 0 END) as sixes
        FROM batting_scorecards bs
        JOIN matches m ON bs.match_id = m.match_id
        WHERE m.stadium_id = ? ${seasonFilter}
        GROUP BY bs.player_id, bs.match_id, bs.innings_number
      ) individual_scores
      JOIN players p ON individual_scores.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON individual_scores.match_id = m.match_id
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      ORDER BY individual_scores.runs DESC
      LIMIT 10`,
         seasonParams
      );

      // Get best bowling figures at this venue
      const [topBowlingFigures] = await pool.execute(
         `SELECT 
        p.name as player_name,
        t.short_name as team_short,
        bow.wickets_taken,
        bow.runs_conceded,
        bow.overs_bowled,
        bow.economy_rate,
        m.match_date,
        CONCAT(t1.short_name, ' vs ', t2.short_name) as match_title
      FROM bowling_scorecards bow
      JOIN players p ON bow.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON bow.match_id = m.match_id
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      WHERE m.stadium_id = ? AND bow.wickets_taken > 0 ${seasonFilter}
      ORDER BY bow.wickets_taken DESC, bow.runs_conceded ASC
      LIMIT 10`,
         seasonParams
      );

      // Get seasonal breakdown if no specific season is provided
      let seasonalBreakdown: any[] | null = null;
      if (!season) {
         const [seasonalData] = await pool.execute(
            `SELECT 
          m.season_year,
          COUNT(DISTINCT m.match_id) as matches_in_season,
          AVG(ts.total_score) as avg_score_in_season,
          MAX(ts.total_score) as highest_score_in_season,
          COUNT(CASE WHEN m.match_status = 'no_result' THEN 1 END) as no_results_in_season
        FROM matches m
        LEFT JOIN team_stats ts ON m.match_id = ts.match_id
        WHERE m.stadium_id = ?
        GROUP BY m.season_year
        ORDER BY m.season_year DESC`,
            [stadiumId]
         );
         seasonalBreakdown = seasonalData as any[];
      }

      return NextResponse.json({
         success: true,
         data: {
            stadium,
            season_filter: season ? parseInt(season) : null,
            overall_stats: (venueStats as any[])[0],
            team_performance: teamPerformance,
            batting_stats: (battingStats as any[])[0],
            bowling_stats: (bowlingStats as any[])[0],
            top_individual_scores: topScores,
            best_bowling_figures: topBowlingFigures,
            seasonal_breakdown: seasonalBreakdown,
         },
      });
   } catch (error) {
      console.error("Error fetching venue statistics:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
