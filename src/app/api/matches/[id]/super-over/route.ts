import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

interface Match extends RowDataPacket {
   match_id: number;
   team1_id: number;
   team2_id: number;
   match_date: string;
   status: string;
   result: string;
   super_over_required: boolean;
   team1_name: string;
   team1_code: string;
   team2_name: string;
   team2_code: string;
}

// GET /api/matches/[id]/super-over - Get super over details
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

      // Check if match exists and had a super over
      const matchQuery = `
      SELECT 
        m.match_id,
        m.team1_id,
        m.team2_id,
        m.match_date,
        m.status,
        m.result,
        m.super_over_required,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      WHERE m.match_id = ?
    `;

      const [matchResult] = await pool.execute<Match[]>(matchQuery, [matchId]);

      if (!matchResult || matchResult.length === 0) {
         return NextResponse.json(
            { success: false, error: "Match not found" },
            { status: 404 }
         );
      }

      const match = matchResult[0];

      if (!match.super_over_required) {
         return NextResponse.json(
            { success: false, error: "This match did not have a super over" },
            { status: 400 }
         );
      }

      // Get super over details
      const superOverQuery = `
      SELECT 
        so.super_over_id,
        so.team1_runs,
        so.team1_wickets,
        so.team1_balls_faced,
        so.team2_runs,
        so.team2_wickets,
        so.team2_balls_faced,
        so.winning_team_id,
        wt.team_name as winning_team_name,
        wt.team_code as winning_team_code,
        so.margin_type,
        so.margin_value,
        so.created_at
      FROM super_over so
      LEFT JOIN teams wt ON so.winning_team_id = wt.team_id
      WHERE so.match_id = ?
    `;

      const [superOverResult] = await pool.execute<RowDataPacket[]>(
         superOverQuery,
         [matchId]
      );

      if (!superOverResult || superOverResult.length === 0) {
         return NextResponse.json(
            { success: false, error: "Super over details not found" },
            { status: 404 }
         );
      }

      const superOver = superOverResult[0];

      // Get super over batting details for both teams
      const superOverBattingQuery = `
      SELECT 
        sob.team_id,
        t.team_name,
        t.team_code,
        sob.player_id,
        p.player_name,
        sob.runs_scored,
        sob.balls_faced,
        sob.fours,
        sob.sixes,
        sob.is_out,
        sob.dismissal_type,
        sob.bowler_id,
        bp.player_name as bowler_name
      FROM super_over_batting sob
      JOIN teams t ON sob.team_id = t.team_id
      JOIN players p ON sob.player_id = p.player_id
      LEFT JOIN players bp ON sob.bowler_id = bp.player_id
      WHERE sob.match_id = ?
      ORDER BY sob.team_id, sob.batting_order
    `;

      const [battingDetails] = await pool.execute<RowDataPacket[]>(
         superOverBattingQuery,
         [matchId]
      );

      // Get super over bowling details for both teams
      const superOverBowlingQuery = `
      SELECT 
        sobl.team_id,
        t.team_name,
        t.team_code,
        sobl.player_id,
        p.player_name,
        sobl.overs_bowled,
        sobl.runs_conceded,
        sobl.wickets_taken,
        sobl.wides,
        sobl.no_balls
      FROM super_over_bowling sobl
      JOIN teams t ON sobl.team_id = t.team_id
      JOIN players p ON sobl.player_id = p.player_id
      WHERE sobl.match_id = ?
      ORDER BY sobl.team_id
    `;

      const [bowlingDetails] = await pool.execute<RowDataPacket[]>(
         superOverBowlingQuery,
         [matchId]
      );

      // Organize batting details by team
      const team1Batting = battingDetails
         ? battingDetails.filter((b: any) => b.team_id === match.team1_id)
         : [];
      const team2Batting = battingDetails
         ? battingDetails.filter((b: any) => b.team_id === match.team2_id)
         : [];

      // Organize bowling details by team
      const team1Bowling = bowlingDetails
         ? bowlingDetails.filter((b: any) => b.team_id === match.team1_id)
         : [];
      const team2Bowling = bowlingDetails
         ? bowlingDetails.filter((b: any) => b.team_id === match.team2_id)
         : [];

      return NextResponse.json({
         success: true,
         data: {
            match_info: match,
            super_over_summary: superOver,
            team1_performance: {
               batting: team1Batting,
               bowling: team1Bowling,
            },
            team2_performance: {
               batting: team2Batting,
               bowling: team2Bowling,
            },
         },
      });
   } catch (error) {
      console.error("Error fetching super over details:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch super over details" },
         { status: 500 }
      );
   }
}
