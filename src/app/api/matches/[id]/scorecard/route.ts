import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/matches/[id]/scorecard - Get match scorecard
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const matchId = parseInt(params.id);

      // Get match info
      const matchQuery = `
      SELECT 
        m.*,
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
      WHERE m.match_id = ?
    `;

      const [matchInfo] = await pool.execute(matchQuery, [matchId]);

      if ((matchInfo as any[]).length === 0) {
         return NextResponse.json(
            { success: false, error: "Match not found" },
            { status: 404 }
         );
      }

      const match = (matchInfo as any[])[0];

      // Get batting scorecard
      const battingQuery = `
      SELECT 
        bs.*,
        p.player_name,
        p.role,
        t.team_name,
        t.team_code
      FROM batting_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON bs.team_id = t.team_id
      WHERE bs.match_id = ?
      ORDER BY t.team_id, bs.batting_order
    `;

      const [battingScorecard] = await pool.execute(battingQuery, [matchId]);

      // Get bowling scorecard
      const bowlingQuery = `
      SELECT 
        bs.*,
        p.player_name,
        p.role,
        t.team_name as bowling_team_name,
        t.team_code as bowling_team_code
      FROM bowling_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON bs.bowling_team_id = t.team_id
      WHERE bs.match_id = ?
      ORDER BY t.team_id, bs.bowling_order
    `;

      const [bowlingScorecard] = await pool.execute(bowlingQuery, [matchId]);

      // Get fall of wickets
      const fowQuery = `
      SELECT 
        fow.*,
        p_out.player_name as batsman_out,
        p_bowler.player_name as bowler_name,
        p_fielder.player_name as fielder_name
      FROM fall_of_wickets fow
      JOIN players p_out ON fow.batsman_out_id = p_out.player_id
      LEFT JOIN players p_bowler ON fow.bowler_id = p_bowler.player_id
      LEFT JOIN players p_fielder ON fow.fielder_id = p_fielder.player_id
      WHERE fow.match_id = ?
      ORDER BY fow.wicket_number
    `;

      const [fallOfWickets] = await pool.execute(fowQuery, [matchId]);

      // Get partnerships
      const partnershipsQuery = `
      SELECT 
        p.*,
        p1.player_name as player1_name,
        p2.player_name as player2_name,
        t.team_name
      FROM partnerships p
      JOIN players p1 ON p.player1_id = p1.player_id
      JOIN players p2 ON p.player2_id = p2.player_id
      JOIN teams t ON p.team_id = t.team_id
      WHERE p.match_id = ?
      ORDER BY p.partnership_order
    `;

      const [partnerships] = await pool.execute(partnershipsQuery, [matchId]);

      // Get extras and totals by team
      const team1Batting = (battingScorecard as any[]).filter(
         (b) => b.team_id === match.team1_id
      );
      const team2Batting = (battingScorecard as any[]).filter(
         (b) => b.team_id === match.team2_id
      );

      const team1Bowling = (bowlingScorecard as any[]).filter(
         (b) => b.bowling_team_id === match.team2_id
      );
      const team2Bowling = (bowlingScorecard as any[]).filter(
         (b) => b.bowling_team_id === match.team1_id
      );

      const calculateTeamTotals = (batting: any[]) => {
         return {
            total_runs: batting.reduce(
               (sum, b) => sum + (b.runs_scored || 0),
               0
            ),
            total_balls: batting.reduce(
               (sum, b) => sum + (b.balls_faced || 0),
               0
            ),
            total_fours: batting.reduce((sum, b) => sum + (b.fours || 0), 0),
            total_sixes: batting.reduce((sum, b) => sum + (b.sixes || 0), 0),
            wickets_lost: batting.filter(
               (b) => b.dismissal_type && b.dismissal_type !== "not out"
            ).length,
         };
      };

      return NextResponse.json({
         success: true,
         data: {
            match,
            scorecard: {
               [match.team1_code]: {
                  team_name: match.team1_name,
                  batting: team1Batting,
                  bowling_against: team2Bowling,
                  totals: calculateTeamTotals(team1Batting),
               },
               [match.team2_code]: {
                  team_name: match.team2_name,
                  batting: team2Batting,
                  bowling_against: team1Bowling,
                  totals: calculateTeamTotals(team2Batting),
               },
            },
            fall_of_wickets: fallOfWickets,
            partnerships: partnerships,
         },
      });
   } catch (error) {
      console.error("Match scorecard error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch match scorecard" },
         { status: 500 }
      );
   }
}
