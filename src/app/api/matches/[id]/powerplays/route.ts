import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../../lib/db";

// GET /api/matches/[id]/powerplays - Get powerplay details
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const matchId = parseInt(params.id);

      if (isNaN(matchId)) {
         return NextResponse.json(
            { success: false, error: "Invalid match ID" },
            { status: 400 }
         );
      }

      // Get match details
      const matchQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.status,
        m.overs,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      WHERE m.match_id = ?
    `;

      const [matchResult] = await pool.execute<RowDataPacket[]>(matchQuery, [
         matchId,
      ]);

      if (!matchResult || matchResult.length === 0) {
         return NextResponse.json(
            { success: false, error: "Match not found" },
            { status: 404 }
         );
      }

      const match = matchResult[0];

      // Get powerplay details
      const powerplayQuery = `
      SELECT 
        pp.powerplay_id,
        pp.team_id,
        t.team_name,
        t.team_code,
        t.primary_color,
        pp.innings_number,
        pp.powerplay_type,
        pp.start_over,
        pp.end_over,
        pp.runs_scored,
        pp.wickets_lost,
        pp.run_rate,
        pp.fielding_restrictions,
        pp.batting_team_score_start,
        pp.batting_team_score_end,
        pp.wickets_at_start,
        pp.wickets_at_end,
        pp.created_at
      FROM powerplays pp
      JOIN teams t ON pp.team_id = t.team_id
      WHERE pp.match_id = ?
      ORDER BY pp.innings_number, pp.start_over
    `;

      const [powerplays] = await pool.execute<RowDataPacket[]>(powerplayQuery, [
         matchId,
      ]);

      // Get ball-by-ball data during powerplays for detailed analysis
      const powerplayBallsQuery = `
      SELECT 
        bbd.ball_id,
        bbd.innings_number,
        bbd.over_number,
        bbd.ball_number,
        bbd.runs_scored,
        bbd.is_wicket,
        bbd.dismissal_type,
        bbd.is_boundary,
        bbd.boundary_type,
        bbd.extras_type,
        bbd.batsman_id,
        bp.player_name as batsman_name,
        bbd.bowler_id,
        bow.player_name as bowler_name,
        pp.powerplay_type
      FROM ball_by_ball_data bbd
      JOIN powerplays pp ON bbd.match_id = pp.match_id 
        AND bbd.innings_number = pp.innings_number
        AND bbd.over_number >= pp.start_over 
        AND bbd.over_number <= pp.end_over
      LEFT JOIN players bp ON bbd.batsman_id = bp.player_id
      LEFT JOIN players bow ON bbd.bowler_id = bow.player_id
      WHERE bbd.match_id = ?
      ORDER BY bbd.innings_number, bbd.over_number, bbd.ball_number
    `;

      const [powerplayBalls] = await pool.execute<RowDataPacket[]>(
         powerplayBallsQuery,
         [matchId]
      );

      // Calculate powerplay statistics
      const powerplayStats: any[] = [];

      if (powerplays) {
         for (const pp of powerplays) {
            const ballsInPowerplay = powerplayBalls
               ? powerplayBalls.filter(
                    (ball: any) =>
                       ball.innings_number === pp.innings_number &&
                       ball.powerplay_type === pp.powerplay_type
                 )
               : [];

            const boundaries = ballsInPowerplay.filter(
               (ball: any) => ball.is_boundary
            );
            const wickets = ballsInPowerplay.filter(
               (ball: any) => ball.is_wicket
            );
            const dots = ballsInPowerplay.filter(
               (ball: any) =>
                  ball.runs_scored === 0 && !ball.is_wicket && !ball.extras_type
            );

            powerplayStats.push({
               ...pp,
               detailed_stats: {
                  total_balls: ballsInPowerplay.length,
                  boundaries: boundaries.length,
                  sixes: boundaries.filter((b: any) => b.boundary_type === "6")
                     .length,
                  fours: boundaries.filter((b: any) => b.boundary_type === "4")
                     .length,
                  wickets: wickets.length,
                  dots: dots.length,
                  dot_percentage:
                     ballsInPowerplay.length > 0
                        ? (
                             (dots.length / ballsInPowerplay.length) *
                             100
                          ).toFixed(2)
                        : 0,
                  boundary_percentage:
                     ballsInPowerplay.length > 0
                        ? (
                             (boundaries.length / ballsInPowerplay.length) *
                             100
                          ).toFixed(2)
                        : 0,
               },
            });
         }
      }

      // Get powerplay comparison between teams
      const comparisonStats = {
         team1_powerplays: powerplayStats.filter(
            (pp: any) => pp.team_name === match.team1_name
         ),
         team2_powerplays: powerplayStats.filter(
            (pp: any) => pp.team_name === match.team2_name
         ),
      };

      // Calculate overall powerplay summary
      const summary = {
         total_powerplays: powerplays ? powerplays.length : 0,
         mandatory_powerplay_overs: 6, // Standard T20 powerplay
         fielding_restriction_overs: 6,
         average_powerplay_score:
            powerplayStats.length > 0
               ? (
                    powerplayStats.reduce(
                       (sum: number, pp: any) => sum + pp.runs_scored,
                       0
                    ) / powerplayStats.length
                 ).toFixed(2)
               : 0,
         total_powerplay_wickets: powerplayStats.reduce(
            (sum: number, pp: any) => sum + pp.wickets_lost,
            0
         ),
         total_powerplay_runs: powerplayStats.reduce(
            (sum: number, pp: any) => sum + pp.runs_scored,
            0
         ),
      };

      return NextResponse.json({
         success: true,
         data: {
            match_info: match,
            powerplays: powerplayStats,
            comparison: comparisonStats,
            summary,
         },
      });
   } catch (error) {
      console.error("Error fetching powerplay details:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch powerplay details" },
         { status: 500 }
      );
   }
}
