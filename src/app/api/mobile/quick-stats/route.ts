import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";

// GET /api/mobile/quick-stats - Get quick stats for mobile app
export async function GET(request: NextRequest) {
   try {
      // Get current season info
      const currentSeasonQuery = `
      SELECT season, series_name, start_date, end_date
      FROM series 
      WHERE is_active = true 
      ORDER BY start_date DESC 
      LIMIT 1
    `;

      const [currentSeason] = await pool.execute(currentSeasonQuery);

      // Get live matches
      const liveMatchesQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.match_time,
        m.status,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        s.stadium_name,
        s.city
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      WHERE m.status = 'live'
      ORDER BY m.match_date DESC, m.match_time DESC
      LIMIT 3
    `;

      const [liveMatches] = await pool.execute(liveMatchesQuery);

      // Get today's matches
      const todayMatchesQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.match_time,
        m.status,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        s.stadium_name
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      WHERE DATE(m.match_date) = CURDATE()
      ORDER BY m.match_time
      LIMIT 5
    `;

      const [todayMatches] = await pool.execute(todayMatchesQuery);

      // Get top run scorers (Orange Cap race)
      const topBatsmenQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        t.team_name,
        t.team_code,
        SUM(bs.runs_scored) as total_runs,
        COUNT(DISTINCT bs.match_id) as matches_played,
        AVG(bs.runs_scored) as avg_runs,
        MAX(bs.runs_scored) as highest_score
      FROM batting_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON bs.match_id = m.match_id
      WHERE m.status = 'completed'
      GROUP BY p.player_id, p.player_name, t.team_name, t.team_code
      ORDER BY total_runs DESC
      LIMIT 5
    `;

      const [topBatsmen] = await pool.execute(topBatsmenQuery);

      // Get top wicket takers (Purple Cap race)
      const topBowlersQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        t.team_name,
        t.team_code,
        SUM(bs.wickets_taken) as total_wickets,
        COUNT(DISTINCT bs.match_id) as matches_played,
        AVG(CASE WHEN bs.overs_bowled > 0 THEN bs.runs_conceded / bs.overs_bowled ELSE 0 END) as economy_rate
      FROM bowling_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON bs.match_id = m.match_id
      WHERE m.status = 'completed' AND bs.overs_bowled > 0
      GROUP BY p.player_id, p.player_name, t.team_name, t.team_code
      ORDER BY total_wickets DESC
      LIMIT 5
    `;

      const [topBowlers] = await pool.execute(topBowlersQuery);

      // Get points table preview (top 4)
      const pointsTableQuery = `
      SELECT 
        t.team_id,
        t.team_name,
        t.team_code,
        ts.matches_played,
        ts.matches_won,
        ts.matches_lost,
        ts.points,
        ts.net_run_rate
      FROM team_stats ts
      JOIN teams t ON ts.team_id = t.team_id
      WHERE ts.season = (
        SELECT season FROM series WHERE is_active = true LIMIT 1
      )
      ORDER BY ts.points DESC, ts.net_run_rate DESC
      LIMIT 4
    `;

      const [pointsTable] = await pool.execute(pointsTableQuery);

      return NextResponse.json({
         success: true,
         data: {
            current_season: (currentSeason as any[])[0] || null,
            live_matches: liveMatches,
            today_matches: todayMatches,
            orange_cap_race: topBatsmen,
            purple_cap_race: topBowlers,
            points_table_preview: pointsTable,
            stats_summary: {
               total_matches_played: await getMatchCount("completed"),
               upcoming_matches: await getMatchCount("upcoming"),
               live_matches_count: (liveMatches as any[]).length,
            },
            last_updated: new Date().toISOString(),
         },
      });
   } catch (error) {
      console.error("Mobile quick stats error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch quick stats" },
         { status: 500 }
      );
   }
}

// Helper function to get match counts
async function getMatchCount(status: string): Promise<number> {
   try {
      const [result] = await pool.execute(
         "SELECT COUNT(*) as count FROM matches WHERE status = ?",
         [status]
      );
      return (result as any)[0].count;
   } catch {
      return 0;
   }
}
