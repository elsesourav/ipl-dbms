import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

interface StatsSummary extends RowDataPacket {
   total_matches: number;
   completed_matches: number;
   total_teams: number;
   total_players: number;
   total_runs: number;
   total_wickets: number;
   total_sixes: number;
   total_fours: number;
   highest_individual_score: number;
   best_bowling_figures: string;
   most_runs_player: string;
   most_wickets_player: string;
}

interface TopPerformer extends RowDataPacket {
   player_id: number;
   player_name: string;
   team_name: string;
   team_code: string;
   value: number;
   matches: number;
}

// GET /api/statistics - Get general statistics overview
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");

      let seriesCondition = "";
      let params: any[] = [];

      if (season) {
         seriesCondition = "AND s.season_year = ?";
         params.push(parseInt(season));
      } else {
         seriesCondition = "AND s.is_completed = false";
      }

      // Get overall statistics
      const [overallStats] = await pool.execute<RowDataPacket[]>(
         `
      SELECT 
        COUNT(DISTINCT m.match_id) as total_matches,
        SUM(CASE WHEN m.is_completed = true THEN 1 ELSE 0 END) as completed_matches,
        COUNT(DISTINCT t.team_id) as total_teams,
        COUNT(DISTINCT p.player_id) as total_players,
        COALESCE(SUM(bs.runs_scored), 0) as total_runs,
        COALESCE(SUM(bow.wickets_taken), 0) as total_wickets,
        COALESCE(SUM(bs.sixes), 0) as total_sixes,
        COALESCE(SUM(bs.fours), 0) as total_fours,
        COALESCE(MAX(bs.runs_scored), 0) as highest_individual_score,
        COUNT(DISTINCT CASE WHEN bs.runs_scored >= 50 THEN bs.scorecard_id END) as total_fifties,
        COUNT(DISTINCT CASE WHEN bs.runs_scored >= 100 THEN bs.scorecard_id END) as total_hundreds
      FROM Series s
      LEFT JOIN Matches m ON s.series_id = m.series_id
      LEFT JOIN Teams t ON m.team1_id = t.team_id OR m.team2_id = t.team_id
      LEFT JOIN PlayerContracts pc ON t.team_id = pc.team_id AND s.series_id = pc.series_id
      LEFT JOIN Players p ON pc.player_id = p.player_id
      LEFT JOIN BattingScorecard bs ON m.match_id = bs.match_id AND m.is_completed = true
      LEFT JOIN BowlingScorecard bow ON m.match_id = bow.match_id AND m.is_completed = true
      WHERE 1=1 ${seriesCondition}
    `,
         params
      );

      // Get top run scorers
      const [topBatsmen] = await pool.execute<TopPerformer[]>(
         `
      SELECT 
        p.player_id,
        p.player_name,
        t.team_name,
        t.team_code,
        SUM(bs.runs_scored) as value,
        COUNT(DISTINCT bs.match_id) as matches,
        ROUND(AVG(bs.runs_scored), 2) as average,
        MAX(bs.runs_scored) as highest_score
      FROM BattingScorecard bs
      JOIN Players p ON bs.player_id = p.player_id
      JOIN Teams t ON bs.team_id = t.team_id
      JOIN Matches m ON bs.match_id = m.match_id
      JOIN Series s ON m.series_id = s.series_id
      WHERE m.is_completed = true ${seriesCondition}
      GROUP BY p.player_id, p.player_name, t.team_name, t.team_code
      HAVING SUM(bs.runs_scored) > 0
      ORDER BY value DESC
      LIMIT 10
    `,
         params
      );

      // Get top wicket takers
      const [topBowlers] = await pool.execute<TopPerformer[]>(
         `
      SELECT 
        p.player_id,
        p.player_name,
        t.team_name,
        t.team_code,
        SUM(bow.wickets_taken) as value,
        COUNT(DISTINCT bow.match_id) as matches,
        ROUND(AVG(bow.economy_rate), 2) as economy_rate,
        CONCAT(MAX(bow.wickets_taken), '/', MIN(bow.runs_conceded)) as best_figures
      FROM BowlingScorecard bow
      JOIN Players p ON bow.player_id = p.player_id
      JOIN Teams t ON bow.team_id = t.team_id
      JOIN Matches m ON bow.match_id = m.match_id
      JOIN Series s ON m.series_id = s.series_id
      WHERE m.is_completed = true ${seriesCondition}
      GROUP BY p.player_id, p.player_name, t.team_name, t.team_code
      HAVING SUM(bow.wickets_taken) > 0
      ORDER BY value DESC, economy_rate ASC
      LIMIT 10
    `,
         params
      );

      // Get team statistics
      const [teamStats] = await pool.execute<RowDataPacket[]>(
         `
      SELECT 
        t.team_name,
        t.team_code,
        COUNT(DISTINCT m.match_id) as matches_played,
        SUM(CASE WHEN m.winner_id = t.team_id THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN m.winner_id != t.team_id AND m.winner_id IS NOT NULL THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN m.win_type = 'no_result' THEN 1 ELSE 0 END) as no_results,
        COALESCE(ts.points, 0) as points,
        COALESCE(ts.net_run_rate, 0.00) as net_run_rate
      FROM Teams t
      LEFT JOIN Matches m ON (t.team_id = m.team1_id OR t.team_id = m.team2_id)
      LEFT JOIN Series s ON m.series_id = s.series_id
      LEFT JOIN TeamStats ts ON t.team_id = ts.team_id AND s.series_id = ts.series_id
      WHERE t.is_active = true AND m.is_completed = true ${seriesCondition}
      GROUP BY t.team_id, t.team_name, t.team_code, ts.points, ts.net_run_rate
      ORDER BY points DESC, net_run_rate DESC
    `,
         params
      );

      // Get recent milestones
      const [recentMilestones] = await pool.execute<RowDataPacket[]>(
         `
      SELECT 
        'Century' as milestone_type,
        p.player_name,
        t.team_name,
        bs.runs_scored as value,
        m.match_date,
        CONCAT(t1.team_code, ' vs ', t2.team_code) as match_info
      FROM BattingScorecard bs
      JOIN Players p ON bs.player_id = p.player_id
      JOIN Teams t ON bs.team_id = t.team_id
      JOIN Matches m ON bs.match_id = m.match_id
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Series s ON m.series_id = s.series_id
      WHERE bs.runs_scored >= 100 AND m.is_completed = true ${seriesCondition}
      
      UNION ALL
      
      SELECT 
        'Five Wickets' as milestone_type,
        p.player_name,
        t.team_name,
        bow.wickets_taken as value,
        m.match_date,
        CONCAT(t1.team_code, ' vs ', t2.team_code) as match_info
      FROM BowlingScorecard bow
      JOIN Players p ON bow.player_id = p.player_id
      JOIN Teams t ON bow.team_id = t.team_id
      JOIN Matches m ON bow.match_id = m.match_id
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Series s ON m.series_id = s.series_id
      WHERE bow.wickets_taken >= 5 AND m.is_completed = true ${seriesCondition}
      
      ORDER BY match_date DESC
      LIMIT 10
    `,
         params
      );

      // Get match statistics
      const [matchStatistics] = await pool.execute<RowDataPacket[]>(
         `
      SELECT 
        COUNT(*) as total_matches,
        SUM(CASE WHEN super_over_required = true THEN 1 ELSE 0 END) as super_over_matches,
        SUM(CASE WHEN impact_player_used_team1 = true OR impact_player_used_team2 = true THEN 1 ELSE 0 END) as impact_player_matches,
        AVG(CASE WHEN win_type = 'runs' THEN win_margin END) as avg_runs_margin,
        AVG(CASE WHEN win_type = 'wickets' THEN win_margin END) as avg_wickets_margin
      FROM Matches m
      JOIN Series s ON m.series_id = s.series_id
      WHERE m.is_completed = true ${seriesCondition}
    `,
         params
      );

      return NextResponse.json({
         success: true,
         data: {
            overview: overallStats[0],
            topPerformers: {
               batsmen: topBatsmen,
               bowlers: topBowlers,
            },
            teamStandings: teamStats,
            recentMilestones: recentMilestones,
            matchStats: matchStatistics[0],
            generatedAt: new Date().toISOString(),
         },
      });
   } catch (error) {
      console.error("Error fetching statistics:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch statistics" },
         { status: 500 }
      );
   }
}
