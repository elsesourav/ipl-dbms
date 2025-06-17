import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { season: string } }
) {
   try {
      const season = parseInt(params.season);

      if (isNaN(season)) {
         return NextResponse.json({ error: "Invalid season" }, { status: 400 });
      }

      // Get comprehensive team statistics for the season
      const [teamStats] = await pool.execute(
         `SELECT 
        t.team_id,
        t.name as team_name,
        t.short_name,
        t.primary_color,
        COUNT(DISTINCT m.match_id) as matches_played,
        COUNT(CASE WHEN m.winning_team_id = t.team_id THEN 1 END) as matches_won,
        COUNT(CASE WHEN m.winning_team_id != t.team_id AND m.match_status = 'completed' THEN 1 END) as matches_lost,
        COUNT(CASE WHEN m.match_status = 'no_result' THEN 1 END) as no_results,
        ROUND(COUNT(CASE WHEN m.winning_team_id = t.team_id THEN 1 END) * 100.0 / COUNT(DISTINCT m.match_id), 2) as win_percentage,
        
        -- Batting Statistics
        AVG(CASE WHEN ts.team_id = t.team_id THEN ts.total_score END) as avg_score,
        MAX(CASE WHEN ts.team_id = t.team_id THEN ts.total_score END) as highest_score,
        MIN(CASE WHEN ts.team_id = t.team_id THEN ts.total_score END) as lowest_score,
        SUM(CASE WHEN ts.team_id = t.team_id THEN ts.total_score ELSE 0 END) as total_runs_scored,
        
        -- Bowling Statistics  
        AVG(CASE WHEN ts.team_id != t.team_id THEN ts.total_score END) as avg_runs_conceded,
        MIN(CASE WHEN ts.team_id != t.team_id THEN ts.total_score END) as best_bowling_score,
        SUM(CASE WHEN ts.team_id != t.team_id THEN ts.total_score ELSE 0 END) as total_runs_conceded,
        
        -- Net Run Rate calculation
        ROUND(
          (SUM(CASE WHEN ts.team_id = t.team_id THEN ts.total_score ELSE 0 END) / 
           SUM(CASE WHEN ts.team_id = t.team_id THEN ts.overs_faced ELSE 0 END)) -
          (SUM(CASE WHEN ts.team_id != t.team_id THEN ts.total_score ELSE 0 END) / 
           SUM(CASE WHEN ts.team_id != t.team_id THEN ts.overs_faced ELSE 0 END)), 3
        ) as net_run_rate,
        
        -- Points (assuming 2 points for win, 1 for no result)
        (COUNT(CASE WHEN m.winning_team_id = t.team_id THEN 1 END) * 2 + 
         COUNT(CASE WHEN m.match_status = 'no_result' THEN 1 END)) as points
        
      FROM teams t
      LEFT JOIN matches m ON (t.team_id = m.team1_id OR t.team_id = m.team2_id)
      LEFT JOIN team_stats ts ON m.match_id = ts.match_id
      WHERE m.season_year = ?
      GROUP BY t.team_id, t.name, t.short_name, t.primary_color
      ORDER BY points DESC, net_run_rate DESC`,
         [season]
      );

      // Get head-to-head records
      const [headToHead] = await pool.execute(
         `SELECT 
        t1.team_id as team1_id,
        t1.short_name as team1_short,
        t2.team_id as team2_id,
        t2.short_name as team2_short,
        COUNT(*) as total_matches,
        COUNT(CASE WHEN m.winning_team_id = t1.team_id THEN 1 END) as team1_wins,
        COUNT(CASE WHEN m.winning_team_id = t2.team_id THEN 1 END) as team2_wins
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      WHERE m.season_year = ? AND m.match_status = 'completed'
      GROUP BY t1.team_id, t1.short_name, t2.team_id, t2.short_name
      ORDER BY t1.short_name, t2.short_name`,
         [season]
      );

      // Get milestone achievements
      const [milestones] = await pool.execute(
         `SELECT 
        t.team_id,
        t.short_name,
        COUNT(CASE WHEN ts.total_score >= 200 THEN 1 END) as scores_200_plus,
        COUNT(CASE WHEN ts.total_score < 100 THEN 1 END) as scores_under_100,
        COUNT(CASE WHEN m.result_type = 'runs' AND m.winning_team_id = t.team_id AND m.win_margin >= 50 THEN 1 END) as big_wins_by_runs,
        COUNT(CASE WHEN m.result_type = 'wickets' AND m.winning_team_id = t.team_id AND m.win_margin >= 8 THEN 1 END) as big_wins_by_wickets,
        COUNT(CASE WHEN m.match_id IN (SELECT match_id FROM super_overs) THEN 1 END) as super_over_matches
      FROM teams t
      LEFT JOIN matches m ON (t.team_id = m.team1_id OR t.team_id = m.team2_id)
      LEFT JOIN team_stats ts ON m.match_id = ts.match_id AND ts.team_id = t.team_id
      WHERE m.season_year = ?
      GROUP BY t.team_id, t.short_name`,
         [season]
      );

      // Get season summary
      const [seasonSummary] = await pool.execute(
         `SELECT 
        COUNT(DISTINCT t.team_id) as total_teams,
        COUNT(DISTINCT m.match_id) as total_matches,
        AVG(ts.total_score) as avg_match_score,
        MAX(ts.total_score) as highest_team_score,
        MIN(ts.total_score) as lowest_team_score,
        SUM(ts.total_score) as total_runs_in_season
      FROM teams t
      JOIN matches m ON (t.team_id = m.team1_id OR t.team_id = m.team2_id)
      JOIN team_stats ts ON m.match_id = ts.match_id
      WHERE m.season_year = ?`,
         [season]
      );

      return NextResponse.json({
         success: true,
         data: {
            season,
            team_standings: teamStats,
            head_to_head_records: headToHead,
            milestone_achievements: milestones,
            season_summary: (seasonSummary as any[])[0],
         },
      });
   } catch (error) {
      console.error("Error fetching team statistics:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
