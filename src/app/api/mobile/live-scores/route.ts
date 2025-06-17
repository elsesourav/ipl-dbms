import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";

// GET /api/mobile/live-scores - Get optimized live scores for mobile
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const matchId = searchParams.get("matchId");

      if (matchId) {
         // Get specific match live score
         return await getSpecificMatchLiveScore(parseInt(matchId));
      }

      // Get current season
      const seasonQuery =
         "SELECT MAX(season_year) as current_season, series_id FROM Series GROUP BY series_id ORDER BY current_season DESC LIMIT 1";
      const [seasonResult] = await pool.execute<RowDataPacket[]>(seasonQuery);

      if (seasonResult.length === 0) {
         return NextResponse.json(
            {
               success: false,
               error: "No active season found",
            },
            { status: 404 }
         );
      }

      const seriesId = seasonResult[0].series_id;

      // Get all live matches
      const liveMatchesQuery = `
      SELECT 
        m.match_id,
        m.match_number,
        m.match_date,
        m.match_time,
        m.match_status,
        m.match_type,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t1.team_color as team1_color,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        t2.team_color as team2_color,
        s.stadium_name,
        s.city,
        tw.team_code as toss_winner,
        m.toss_decision
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Stadiums s ON m.stadium_id = s.stadium_id
      LEFT JOIN Teams tw ON m.toss_winner_id = tw.team_id
      WHERE m.series_id = ? AND m.match_status IN ('live', 'scheduled')
      ORDER BY 
        CASE WHEN m.match_status = 'live' THEN 0 ELSE 1 END,
        m.match_date ASC, m.match_time ASC
    `;

      const [matches] = await pool.execute<RowDataPacket[]>(liveMatchesQuery, [
         seriesId,
      ]);

      const liveScores: any[] = [];

      for (const match of matches) {
         if (match.match_status === "live") {
            // Get live scores for this match
            const scoreQuery = `
          SELECT 
            bs.team_id,
            t.team_code,
            t.team_color,
            SUM(bs.runs_scored) as runs,
            COUNT(CASE WHEN bs.is_out = TRUE THEN 1 END) as wickets,
            SUM(bs.balls_faced) as balls,
            ROUND(SUM(bs.balls_faced) / 6, 1) as overs
          FROM BattingScorecard bs
          JOIN Teams t ON bs.team_id = t.team_id
          WHERE bs.match_id = ?
          GROUP BY bs.team_id, t.team_code, t.team_color
        `;

            const [scores] = await pool.execute<RowDataPacket[]>(scoreQuery, [
               match.match_id,
            ]);

            // Get current batsmen (if live)
            const currentBatsmenQuery = `
          SELECT 
            p.player_name,
            bs.runs_scored,
            bs.balls_faced,
            CASE WHEN bs.balls_faced > 0 THEN ROUND((bs.runs_scored * 100.0 / bs.balls_faced), 1) ELSE 0 END as strike_rate
          FROM BattingScorecard bs
          JOIN Players p ON bs.player_id = p.player_id
          WHERE bs.match_id = ? AND bs.is_out = FALSE
          ORDER BY bs.runs_scored DESC
          LIMIT 2
        `;

            const [currentBatsmen] = await pool.execute<RowDataPacket[]>(
               currentBatsmenQuery,
               [match.match_id]
            );

            // Get current bowler stats
            const currentBowlerQuery = `
          SELECT 
            p.player_name,
            bow.overs_bowled,
            bow.runs_conceded,
            bow.wickets_taken,
            CASE WHEN bow.overs_bowled > 0 THEN ROUND(bow.runs_conceded / bow.overs_bowled, 1) ELSE 0 END as economy
          FROM BowlingScorecard bow
          JOIN Players p ON bow.player_id = p.player_id
          WHERE bow.match_id = ?
          ORDER BY bow.overs_bowled DESC
          LIMIT 1
        `;

            const [currentBowler] = await pool.execute<RowDataPacket[]>(
               currentBowlerQuery,
               [match.match_id]
            );

            liveScores.push({
               ...match,
               scores: scores,
               current_batsmen: currentBatsmen,
               current_bowler: currentBowler[0] || null,
               status: "live",
            });
         } else {
            // Scheduled match
            liveScores.push({
               ...match,
               scores: [],
               current_batsmen: [],
               current_bowler: null,
               status: "scheduled",
            });
         }
      }

      // Get recent completed matches for context
      const recentCompletedQuery = `
      SELECT 
        m.match_id,
        m.match_number,
        m.match_date,
        t1.team_code as team1_code,
        t1.team_color as team1_color,
        t2.team_code as team2_code,
        t2.team_color as team2_color,
        w.team_code as winner_code,
        m.win_type,
        m.win_margin,
        CASE 
          WHEN m.win_type = 'runs' THEN CONCAT('by ', m.win_margin, ' runs')
          WHEN m.win_type = 'wickets' THEN CONCAT('by ', m.win_margin, ' wickets')
          ELSE m.win_type
        END as result_text
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      LEFT JOIN Teams w ON m.winner_id = w.team_id
      WHERE m.series_id = ? AND m.is_completed = TRUE
      ORDER BY m.match_date DESC, m.match_id DESC
      LIMIT 3
    `;

      const [recentCompleted] = await pool.execute<RowDataPacket[]>(
         recentCompletedQuery,
         [seriesId]
      );

      return NextResponse.json({
         success: true,
         data: {
            live_matches: liveScores.filter((m) => m.status === "live"),
            upcoming_matches: liveScores
               .filter((m) => m.status === "scheduled")
               .slice(0, 3),
            recent_matches: recentCompleted,
            last_updated: new Date().toISOString(),
         },
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch live scores",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

async function getSpecificMatchLiveScore(matchId: number) {
   try {
      // Get match details
      const matchQuery = `
      SELECT 
        m.match_id,
        m.match_number,
        m.match_date,
        m.match_time,
        m.match_status,
        m.match_type,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t1.team_color as team1_color,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        t2.team_color as team2_color,
        s.stadium_name,
        s.city,
        tw.team_code as toss_winner,
        m.toss_decision,
        w.team_code as winner_code,
        m.win_type,
        m.win_margin
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Stadiums s ON m.stadium_id = s.stadium_id
      LEFT JOIN Teams tw ON m.toss_winner_id = tw.team_id
      LEFT JOIN Teams w ON m.winner_id = w.team_id
      WHERE m.match_id = ?
    `;

      const [matchResult] = await pool.execute<RowDataPacket[]>(matchQuery, [
         matchId,
      ]);

      if (matchResult.length === 0) {
         return NextResponse.json(
            { success: false, error: "Match not found" },
            { status: 404 }
         );
      }

      const match = matchResult[0];

      // Get detailed scores
      const scoreQuery = `
      SELECT 
        bs.team_id,
        t.team_code,
        t.team_color,
        SUM(bs.runs_scored) as runs,
        COUNT(CASE WHEN bs.is_out = TRUE THEN 1 END) as wickets,
        SUM(bs.balls_faced) as balls,
        SUM(bs.fours) as fours,
        SUM(bs.sixes) as sixes,
        ROUND(SUM(bs.balls_faced) / 6, 1) as overs,
        CASE WHEN SUM(bs.balls_faced) > 0 THEN ROUND((SUM(bs.runs_scored) * 100.0 / SUM(bs.balls_faced)), 1) ELSE 0 END as run_rate
      FROM BattingScorecard bs
      JOIN Teams t ON bs.team_id = t.team_id
      WHERE bs.match_id = ?
      GROUP BY bs.team_id, t.team_code, t.team_color
    `;

      const [scores] = await pool.execute<RowDataPacket[]>(scoreQuery, [
         matchId,
      ]);

      // Get current partnership (if live)
      const partnershipQuery = `
      SELECT 
        p1.player_name as batsman1,
        bs1.runs_scored as batsman1_runs,
        bs1.balls_faced as batsman1_balls,
        p2.player_name as batsman2,
        bs2.runs_scored as batsman2_runs,
        bs2.balls_faced as batsman2_balls,
        (bs1.runs_scored + bs2.runs_scored) as partnership_runs,
        (bs1.balls_faced + bs2.balls_faced) as partnership_balls
      FROM BattingScorecard bs1
      JOIN Players p1 ON bs1.player_id = p1.player_id
      JOIN BattingScorecard bs2 ON bs1.match_id = bs2.match_id AND bs1.team_id = bs2.team_id
      JOIN Players p2 ON bs2.player_id = p2.player_id
      WHERE bs1.match_id = ? AND bs1.is_out = FALSE AND bs2.is_out = FALSE
      AND bs1.player_id < bs2.player_id
      LIMIT 1
    `;

      const [partnership] = await pool.execute<RowDataPacket[]>(
         partnershipQuery,
         [matchId]
      );

      return NextResponse.json({
         success: true,
         data: {
            match: match,
            scores: scores,
            partnership: partnership[0] || null,
            last_updated: new Date().toISOString(),
         },
      });
   } catch (error) {
      throw error;
   }
}
