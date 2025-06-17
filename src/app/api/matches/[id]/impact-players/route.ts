import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../../lib/db";

// GET /api/matches/[id]/impact-players - Get impact player substitutions
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
        m.impact_player_used,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        s.stadium_name
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      LEFT JOIN stadiums s ON m.stadium_id = s.stadium_id
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

      // Get impact player substitutions
      const impactPlayerQuery = `
      SELECT 
        ips.substitution_id,
        ips.team_id,
        t.team_name,
        t.team_code,
        t.primary_color,
        ips.player_in_id,
        pin.player_name as player_in_name,
        pin.role as player_in_role,
        ips.player_out_id,
        pout.player_name as player_out_name,
        pout.role as player_out_role,
        ips.substitution_over,
        ips.substitution_ball,
        ips.innings_number,
        ips.reason,
        ips.tactical_change,
        ips.substitution_time,
        ips.team_score_at_substitution,
        ips.team_wickets_at_substitution,
        ips.created_at
      FROM impact_player_substitutions ips
      JOIN teams t ON ips.team_id = t.team_id
      JOIN players pin ON ips.player_in_id = pin.player_id
      JOIN players pout ON ips.player_out_id = pout.player_id
      WHERE ips.match_id = ?
      ORDER BY ips.substitution_time, ips.team_id
    `;

      const [impactPlayers] = await pool.execute<RowDataPacket[]>(
         impactPlayerQuery,
         [matchId]
      );

      if (
         !match.impact_player_used ||
         !impactPlayers ||
         impactPlayers.length === 0
      ) {
         return NextResponse.json({
            success: true,
            data: {
               match_info: match,
               impact_player_used: false,
               substitutions: [],
               message:
                  "No impact player substitutions were made in this match",
            },
         });
      }

      // Get performance analysis of impact players
      const performanceAnalysis: any[] = [];

      for (const sub of impactPlayers) {
         // Get batting performance of the impact player
         const battingQuery = `
        SELECT 
          bs.runs_scored,
          bs.balls_faced,
          bs.fours,
          bs.sixes,
          bs.is_out,
          bs.dismissal_type,
          CASE 
            WHEN bs.balls_faced > 0 THEN ROUND((bs.runs_scored * 100.0) / bs.balls_faced, 2)
            ELSE 0 
          END as strike_rate
        FROM batting_scorecards bs
        WHERE bs.match_id = ? AND bs.player_id = ?
      `;

         const [battingPerf] = await pool.execute<RowDataPacket[]>(
            battingQuery,
            [matchId, sub.player_in_id]
         );

         // Get bowling performance of the impact player
         const bowlingQuery = `
        SELECT 
          bls.overs_bowled,
          bls.runs_conceded,
          bls.wickets_taken,
          bls.maiden_overs,
          bls.wides,
          bls.no_balls,
          CASE 
            WHEN bls.overs_bowled > 0 THEN ROUND(bls.runs_conceded / bls.overs_bowled, 2)
            ELSE 0 
          END as economy_rate
        FROM bowling_scorecards bls
        WHERE bls.match_id = ? AND bls.player_id = ?
      `;

         const [bowlingPerf] = await pool.execute<RowDataPacket[]>(
            bowlingQuery,
            [matchId, sub.player_in_id]
         );

         // Get fielding performance
         const fieldingQuery = `
        SELECT 
          COUNT(CASE WHEN d.dismissal_type = 'caught' AND d.fielder_id = ? THEN 1 END) as catches,
          COUNT(CASE WHEN d.dismissal_type = 'run out' AND d.fielder_id = ? THEN 1 END) as run_outs,
          COUNT(CASE WHEN d.dismissal_type = 'stumped' AND d.fielder_id = ? THEN 1 END) as stumpings
        FROM dismissals d
        JOIN batting_scorecards bs ON d.scorecard_id = bs.scorecard_id
        WHERE bs.match_id = ?
      `;

         const [fieldingPerf] = await pool.execute<RowDataPacket[]>(
            fieldingQuery,
            [sub.player_in_id, sub.player_in_id, sub.player_in_id, matchId]
         );

         performanceAnalysis.push({
            substitution: sub,
            impact_player_performance: {
               batting:
                  battingPerf && battingPerf.length > 0 ? battingPerf[0] : null,
               bowling:
                  bowlingPerf && bowlingPerf.length > 0 ? bowlingPerf[0] : null,
               fielding:
                  fieldingPerf && fieldingPerf.length > 0
                     ? fieldingPerf[0]
                     : null,
            },
         });
      }

      // Calculate impact summary
      const impactSummary = {
         total_substitutions: impactPlayers.length,
         teams_used_impact_player: [
            ...new Set(impactPlayers.map((ip: any) => ip.team_id)),
         ].length,
         substitution_timing: {
            first_innings: impactPlayers.filter(
               (ip: any) => ip.innings_number === 1
            ).length,
            second_innings: impactPlayers.filter(
               (ip: any) => ip.innings_number === 2
            ).length,
         },
         tactical_changes: impactPlayers.filter((ip: any) => ip.tactical_change)
            .length,
         roles_substituted: {
            batsmen_in: impactPlayers.filter(
               (ip: any) => ip.player_in_role === "Batsman"
            ).length,
            bowlers_in: impactPlayers.filter(
               (ip: any) => ip.player_in_role === "Bowler"
            ).length,
            all_rounders_in: impactPlayers.filter(
               (ip: any) => ip.player_in_role === "All-Rounder"
            ).length,
            wicket_keepers_in: impactPlayers.filter(
               (ip: any) => ip.player_in_role === "Wicket-Keeper"
            ).length,
         },
      };

      return NextResponse.json({
         success: true,
         data: {
            match_info: match,
            impact_player_used: true,
            substitutions: impactPlayers,
            performance_analysis: performanceAnalysis,
            impact_summary: impactSummary,
         },
      });
   } catch (error) {
      console.error("Error fetching impact player details:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch impact player details" },
         { status: 500 }
      );
   }
}
