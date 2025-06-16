import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
   try {

      console.log("Fetching statistics...");

      // Get basic statistics
      const [teamStats] = await pool.execute(
         "SELECT COUNT(*) as total_teams FROM Teams"
      );

      const [playerStats] = await pool.execute(
         "SELECT COUNT(*) as total_players FROM Players"
      );

      const [matchStats] = await pool.execute(
         "SELECT COUNT(*) as total_matches FROM Matches"
      );

      const [seriesStats] = await pool.execute(
         "SELECT COUNT(*) as total_series FROM Series"
      );

      // Get top scorers from BattingScorecard
      const [topScorers] = await pool.execute(`
         SELECT 
            p.player_id,
            p.player_name,
            t.team_name,
            p.role,
            SUM(bs.runs_scored) as total_runs,
            SUM(bs.balls_faced) as total_balls,
            SUM(bs.fours) as total_fours,
            SUM(bs.sixes) as total_sixes,
            MAX(bs.runs_scored) as highest_score,
            COUNT(DISTINCT bs.match_id) as matches_played,
            CASE 
               WHEN SUM(bs.balls_faced) > 0 THEN ROUND((SUM(bs.runs_scored) * 100.0 / SUM(bs.balls_faced)), 2)
               ELSE 0.0
            END as strike_rate,
            SUM(CASE WHEN bs.runs_scored >= 50 AND bs.runs_scored < 100 THEN 1 ELSE 0 END) as fifties,
            SUM(CASE WHEN bs.runs_scored >= 100 THEN 1 ELSE 0 END) as hundreds
         FROM Players p
         LEFT JOIN Teams t ON p.team_id = t.team_id
         LEFT JOIN BattingScorecard bs ON p.player_id = bs.player_id
         WHERE bs.runs_scored IS NOT NULL
         GROUP BY p.player_id, p.player_name, t.team_name, p.role
         HAVING total_runs > 0
         ORDER BY total_runs DESC
         LIMIT 10
      `);

      // Get top wicket takers from BowlingScorecard
      const [topBowlers] = await pool.execute(`
         SELECT 
            p.player_id,
            p.player_name,
            t.team_name,
            p.role,
            SUM(bow.wickets_taken) as total_wickets,
            SUM(bow.overs_bowled) as total_overs,
            SUM(bow.runs_conceded) as total_runs_conceded,
            SUM(bow.maiden_overs) as maiden_overs,
            COUNT(DISTINCT bow.match_id) as matches_bowled,
            CASE 
               WHEN SUM(bow.overs_bowled) > 0 THEN ROUND((SUM(bow.runs_conceded) / SUM(bow.overs_bowled)), 2)
               ELSE 0.0
            END as economy_rate,
            CASE 
               WHEN SUM(bow.wickets_taken) > 0 THEN ROUND((SUM(bow.runs_conceded) / SUM(bow.wickets_taken)), 2)
               ELSE 0.0
            END as average
         FROM Players p
         LEFT JOIN Teams t ON p.team_id = t.team_id
         LEFT JOIN BowlingScorecard bow ON p.player_id = bow.player_id
         WHERE bow.wickets_taken IS NOT NULL
         GROUP BY p.player_id, p.player_name, t.team_name, p.role
         HAVING total_wickets > 0
         ORDER BY total_wickets DESC
         LIMIT 10
      `);

      // Get team performance
      const [teamPerformance] = await pool.execute(`
         SELECT 
            t.team_id,
            t.team_name,
            t.team_code,
            t.city,
            t.team_color,
            COUNT(m.match_id) as matches_played,
            SUM(CASE WHEN m.winner_id = t.team_id THEN 1 ELSE 0 END) as matches_won,
            SUM(CASE WHEN m.winner_id != t.team_id AND m.winner_id IS NOT NULL THEN 1 ELSE 0 END) as matches_lost,
            SUM(CASE WHEN m.winner_id IS NULL AND m.is_completed = 1 THEN 1 ELSE 0 END) as no_results,
            ROUND(
               (SUM(CASE WHEN m.winner_id = t.team_id THEN 1 ELSE 0 END) * 100.0) / 
               NULLIF(COUNT(m.match_id), 0), 2
            ) as win_percentage,
            (SUM(CASE WHEN m.winner_id = t.team_id THEN 1 ELSE 0 END) * 2) + 
            (SUM(CASE WHEN m.winner_id IS NULL AND m.is_completed = 1 THEN 1 ELSE 0 END) * 1) as points
         FROM Teams t
         LEFT JOIN Matches m ON (m.team1_id = t.team_id OR m.team2_id = t.team_id)
         GROUP BY t.team_id, t.team_name, t.team_code, t.city, t.team_color
         HAVING matches_played > 0
         ORDER BY win_percentage DESC, points DESC
      `);

      // Get recent matches
      const [recentMatches] = await pool.execute(`
         SELECT 
            m.match_id,
            m.match_date,
            m.match_type,
            s.series_name,
            s.season_year,
            t1.team_name as team1_name,
            t1.team_code as team1_code,
            t2.team_name as team2_name,
            t2.team_code as team2_code,
            tw.team_name as winner_name,
            st.stadium_name,
            st.city,
            m.is_completed
         FROM Matches m
         LEFT JOIN Series s ON m.series_id = s.series_id
         LEFT JOIN Teams t1 ON m.team1_id = t1.team_id
         LEFT JOIN Teams t2 ON m.team2_id = t2.team_id
         LEFT JOIN Teams tw ON m.winner_id = tw.team_id
         LEFT JOIN Stadiums st ON m.stadium_id = st.stadium_id
         ORDER BY m.match_date DESC, m.match_id DESC
         LIMIT 10
      `);

      const statistics = {
         overview: {
            total_teams: (teamStats as RowDataPacket[])[0]?.total_teams || 0,
            total_players:
               (playerStats as RowDataPacket[])[0]?.total_players || 0,
            total_matches:
               (matchStats as RowDataPacket[])[0]?.total_matches || 0,
            total_series:
               (seriesStats as RowDataPacket[])[0]?.total_series || 0,
         },
         topScorers: topScorers as RowDataPacket[],
         topBowlers: topBowlers as RowDataPacket[],
         teamPerformance: teamPerformance as RowDataPacket[],
         recentMatches: recentMatches as RowDataPacket[],
      };

      return NextResponse.json({ success: true, data: statistics });
   } catch (error) {
      console.error("Error fetching statistics:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch statistics" },
         { status: 500 }
      );
   }
}
