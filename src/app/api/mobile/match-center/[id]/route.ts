import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const matchId = parseInt(params.id);

      if (isNaN(matchId)) {
         return NextResponse.json(
            { error: "Invalid match ID" },
            { status: 400 }
         );
      }

      // Get comprehensive match data for mobile
      const [matches] = await pool.execute(
         `SELECT 
        m.*,
        t1.name as team1_name, t1.short_name as team1_short,
        t2.name as team2_name, t2.short_name as team2_short,
        s.name as stadium_name, s.city as stadium_city,
        ser.name as series_name
       FROM matches m
       JOIN teams t1 ON m.team1_id = t1.team_id
       JOIN teams t2 ON m.team2_id = t2.team_id
       JOIN stadiums s ON m.stadium_id = s.stadium_id
       JOIN series ser ON m.series_id = ser.series_id
       WHERE m.match_id = ?`,
         [matchId]
      );

      if (!(matches as any[]).length) {
         return NextResponse.json(
            { error: "Match not found" },
            { status: 404 }
         );
      }

      const match = (matches as any[])[0];

      // Get live scores
      const [scores] = await pool.execute(
         `SELECT 
        ts.*,
        t.name as team_name,
        t.short_name as team_short
       FROM team_stats ts
       JOIN teams t ON ts.team_id = t.team_id
       WHERE ts.match_id = ?`,
         [matchId]
      );

      // Get recent balls (last 10)
      const [recentBalls] = await pool.execute(
         `SELECT 
        bs.*,
        p.name as batsman_name,
        bow.name as bowler_name
       FROM batting_scorecards bs
       JOIN players p ON bs.player_id = p.player_id
       JOIN players bow ON bs.bowler_id = bow.player_id
       WHERE bs.match_id = ?
       ORDER BY bs.innings_number DESC, bs.over_number DESC, bs.ball_number DESC
       LIMIT 10`,
         [matchId]
      );

      // Get key players on strike
      const [currentBatsmen] = await pool.execute(
         `SELECT 
         p.player_id, p.name, p.jersey_number,
         SUM(bs.runs_scored) as runs,
         COUNT(bs.ball_id) as balls,
         SUM(CASE WHEN bs.runs_scored = 4 THEN 1 ELSE 0 END) as fours,
         SUM(CASE WHEN bs.runs_scored = 6 THEN 1 ELSE 0 END) as sixes
         FROM players p
         JOIN batting_scorecards bs ON p.player_id = bs.player_id
         WHERE bs.match_id = ? AND bs.is_out = FALSE
         GROUP BY p.player_id, p.name, p.jersey_number
         LIMIT 2`,
         [matchId]
      );

      // Get current bowler
      const [currentBowler] = await pool.execute(
         `SELECT 
         p.player_id, p.name, p.jersey_number,
         bow.overs_bowled, bow.runs_conceded, bow.wickets_taken, bow.economy_rate
         FROM players p
         JOIN bowling_scorecards bow ON p.player_id = bow.player_id
         WHERE bow.match_id = ?
         ORDER BY bow.bowling_scorecard_id DESC
         LIMIT 1`,
         [matchId]
      );

      return NextResponse.json({
         success: true,
         data: {
            match: {
               ...match,
               status_display:
                  match.match_status === "completed"
                     ? "Completed"
                     : match.match_status === "live"
                     ? "Live"
                     : match.match_status === "upcoming"
                     ? "Upcoming"
                     : "TBD",
            },
            scores,
            live_action: {
               current_batsmen: currentBatsmen,
               current_bowler: currentBowler[0] || null,
               recent_balls: recentBalls,
            },
         },
      });
   } catch (error) {
      console.error("Error fetching mobile match center data:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
