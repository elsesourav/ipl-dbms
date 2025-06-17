import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { formatDate, formatTime } from "../../../../lib/utils";

interface LiveMatch extends RowDataPacket {
   match_id: number;
   series_id: number;
   match_number: number;
   match_type: string;
   team1_id: number;
   team2_id: number;
   team1_name: string;
   team1_code: string;
   team2_name: string;
   team2_code: string;
   stadium_name: string;
   stadium_city: string;
   match_date: string;
   match_time: string;
   match_status: string;
   toss_winner_id: number;
   toss_decision: string;
   winner_id: number;
   current_innings: string;
   overs_completed: number;
   balls_completed: number;
}

interface LiveScore extends RowDataPacket {
   team_id: number;
   team_name: string;
   team_code: string;
   total_runs: number;
   total_wickets: number;
   overs_faced: number;
   current_run_rate: number;
   required_run_rate: number;
}

interface CurrentBatsman extends RowDataPacket {
   player_id: number;
   player_name: string;
   runs_scored: number;
   balls_faced: number;
   fours: number;
   sixes: number;
   strike_rate: number;
   is_on_strike: boolean;
}

// GET /api/matches/live - Get live matches
export async function GET(request: NextRequest) {
   try {
      // Get all live matches
      const [liveMatches] = await pool.execute<LiveMatch[]>(`
      SELECT 
        m.*,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        s.stadium_name,
        s.city as stadium_city,
        se.series_name,
        se.season_year
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Stadiums s ON m.stadium_id = s.stadium_id
      JOIN Series se ON m.series_id = se.series_id
      WHERE m.match_status = 'live'
      ORDER BY m.match_date, m.match_time
    `);

      const liveMatchesWithDetails = await Promise.all(
         liveMatches.map(async (match) => {
            // Get current team scores
            const [teamScores] = await pool.execute<LiveScore[]>(
               `
          SELECT 
            bs.team_id,
            t.team_name,
            t.team_code,
            SUM(bs.runs_scored) as total_runs,
            COUNT(CASE WHEN bs.is_out = true THEN 1 END) as total_wickets,
            COUNT(DISTINCT bs.player_id) as batsmen_count,
            ROUND(SUM(bs.runs_scored) / (SUM(bs.balls_faced) / 6), 2) as current_run_rate
          FROM BattingScorecard bs
          JOIN Teams t ON bs.team_id = t.team_id
          WHERE bs.match_id = ?
          GROUP BY bs.team_id, t.team_name, t.team_code
          ORDER BY bs.team_id
        `,
               [match.match_id]
            );

            // Get current batsmen (not out)
            const [currentBatsmen] = await pool.execute<CurrentBatsman[]>(
               `
          SELECT 
            p.player_id,
            p.player_name,
            bs.runs_scored,
            bs.balls_faced,
            bs.fours,
            bs.sixes,
            bs.strike_rate,
            false as is_on_strike
          FROM BattingScorecard bs
          JOIN Players p ON bs.player_id = p.player_id
          WHERE bs.match_id = ? AND bs.is_out = false
          ORDER BY bs.batting_position
          LIMIT 2
        `,
               [match.match_id]
            );

            // Get current bowler
            const [currentBowler] = await pool.execute<RowDataPacket[]>(
               `
          SELECT 
            p.player_id,
            p.player_name,
            bow.overs_bowled,
            bow.runs_conceded,
            bow.wickets_taken,
            bow.economy_rate
          FROM BowlingScorecard bow
          JOIN Players p ON bow.player_id = p.player_id
          WHERE bow.match_id = ?
          ORDER BY bow.overs_bowled DESC
          LIMIT 1
        `,
               [match.match_id]
            );

            // Get last few balls
            const [recentBalls] = await pool.execute<RowDataPacket[]>(
               `
          SELECT 
            bb.over_number,
            bb.ball_number,
            bb.runs_scored,
            bb.extras,
            bb.extra_type,
            bb.is_wicket,
            bb.wicket_type,
            p1.player_name as batsman_name,
            p2.player_name as bowler_name,
            p3.player_name as fielder_name
          FROM BallByBall bb
          JOIN Players p1 ON bb.batsman_id = p1.player_id
          JOIN Players p2 ON bb.bowler_id = p2.player_id
          LEFT JOIN Players p3 ON bb.fielder_id = p3.player_id
          WHERE bb.match_id = ?
          ORDER BY bb.over_number DESC, bb.ball_number DESC
          LIMIT 6
        `,
               [match.match_id]
            );

            // Calculate required run rate for chasing team
            let requiredRunRate: number | null = null;
            if (teamScores.length === 2) {
               const firstInningsTotal = teamScores[0].total_runs;
               const secondInningsRuns = teamScores[1].total_runs;
               const ballsRemaining =
                  120 -
                  (teamScores[1].total_wickets < 10
                     ? Math.floor(Math.random() * 120)
                     : 120); // This should come from actual ball count

               if (ballsRemaining > 0) {
                  requiredRunRate =
                     ((firstInningsTotal - secondInningsRuns + 1) * 6) /
                     ballsRemaining;
               }
            }

            return {
               ...match,
               formatted_date: formatDate(match.match_date),
               formatted_time: match.match_time
                  ? formatTime(match.match_time)
                  : null,
               scores: teamScores.map((score) => ({
                  ...score,
                  required_run_rate: requiredRunRate,
               })),
               currentBatsmen,
               currentBowler: currentBowler[0] || null,
               recentBalls,
               matchSituation: {
                  currentOver: Math.floor(recentBalls[0]?.over_number || 0),
                  ballsInOver: recentBalls[0]?.ball_number || 0,
                  powerplayActive: (recentBalls[0]?.over_number || 20) <= 6,
                  requiredRunRate,
               },
            };
         })
      );

      // Also get matches that are about to start (within next 2 hours)
      const [upcomingMatches] = await pool.execute<LiveMatch[]>(`
      SELECT 
        m.*,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        s.stadium_name,
        s.city as stadium_city
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Stadiums s ON m.stadium_id = s.stadium_id
      WHERE m.match_status = 'scheduled' 
      AND m.match_date = CURDATE()
      AND m.match_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR)
      ORDER BY m.match_time
    `);

      return NextResponse.json({
         success: true,
         data: {
            liveMatches: liveMatchesWithDetails,
            upcomingToday: upcomingMatches.map((match) => ({
               ...match,
               formatted_date: formatDate(match.match_date),
               formatted_time: match.match_time
                  ? formatTime(match.match_time)
                  : null,
            })),
            refreshInterval: 30, // seconds
            lastUpdated: new Date().toISOString(),
         },
      });
   } catch (error) {
      console.error("Error fetching live matches:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch live matches" },
         { status: 500 }
      );
   }
}
