import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/matches/[id]/dls - Get DLS application details
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

      // Check if match exists and had DLS applied
      const matchQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.match_time,
        m.status,
        m.result,
        m.dls_applied,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        s.stadium_name,
        s.city as stadium_city
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

      if (!match.dls_applied) {
         return NextResponse.json({
            success: true,
            data: {
               match_info: match,
               dls_applied: false,
               message: "DLS was not applied in this match",
            },
         });
      }

      // Get DLS calculations
      const dlsQuery = `
      SELECT 
        dls.dls_id,
        dls.team_id,
        t.team_name,
        t.team_code,
        dls.innings_number,
        dls.interruption_start_over,
        dls.interruption_end_over,
        dls.overs_lost,
        dls.wickets_lost_at_interruption,
        dls.runs_scored_at_interruption,
        dls.original_target,
        dls.revised_target,
        dls.par_score,
        dls.resource_percentage_lost,
        dls.dls_method_version,
        dls.calculation_notes,
        dls.created_at
      FROM dls_calculations dls
      JOIN teams t ON dls.team_id = t.team_id
      WHERE dls.match_id = ?
      ORDER BY dls.innings_number, dls.created_at
    `;

      const [dlsCalculations] = await pool.execute<RowDataPacket[]>(dlsQuery, [
         matchId,
      ]);

      // Get weather/interruption details
      const interruptionQuery = `
      SELECT 
        mi.interruption_id,
        mi.interruption_type,
        mi.start_time,
        mi.end_time,
        mi.duration_minutes,
        mi.reason,
        mi.innings_affected,
        mi.over_when_stopped,
        mi.ball_when_stopped,
        mi.runs_at_stoppage,
        mi.wickets_at_stoppage,
        mi.notes
      FROM match_interruptions mi
      WHERE mi.match_id = ?
      ORDER BY mi.start_time
    `;

      const [interruptions] = await pool.execute<RowDataPacket[]>(
         interruptionQuery,
         [matchId]
      );

      // Get revised scorecard if available
      const revisedScoreQuery = `
      SELECT 
        ts.team_id,
        t.team_name,
        t.team_code,
        ts.innings_number,
        ts.total_runs,
        ts.total_wickets,
        ts.total_overs,
        ts.run_rate,
        ts.required_run_rate,
        ts.balls_remaining,
        ts.target_score
      FROM team_stats ts
      JOIN teams t ON ts.team_id = t.team_id
      WHERE ts.match_id = ? AND ts.is_dls_adjusted = true
      ORDER BY ts.innings_number
    `;

      const [revisedScores] = await pool.execute<RowDataPacket[]>(
         revisedScoreQuery,
         [matchId]
      );

      // Calculate DLS impact summary
      const dlsSummary = {
         total_interruptions: interruptions ? interruptions.length : 0,
         total_time_lost: interruptions
            ? interruptions.reduce(
                 (sum: number, int: any) => sum + (int.duration_minutes || 0),
                 0
              )
            : 0,
         teams_affected: dlsCalculations ? dlsCalculations.length : 0,
         method_used:
            dlsCalculations && dlsCalculations.length > 0
               ? dlsCalculations[0].dls_method_version
               : null,
         match_result_affected: match.result?.includes("DLS") || false,
      };

      return NextResponse.json({
         success: true,
         data: {
            match_info: match,
            dls_applied: true,
            dls_calculations: dlsCalculations || [],
            interruptions: interruptions || [],
            revised_scores: revisedScores || [],
            dls_summary: dlsSummary,
         },
      });
   } catch (error) {
      console.error("Error fetching DLS details:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch DLS details" },
         { status: 500 }
      );
   }
}
