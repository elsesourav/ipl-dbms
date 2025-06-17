import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Update match results and completion status
export async function PUT(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const body = await request.json();
      const {
         winner_id,
         win_type,
         win_margin,
         man_of_match_id,
         is_completed = true,
      } = body;

      // Update match result
      const [result] = await pool.execute(
         `UPDATE Matches SET 
            winner_id = ?, 
            win_type = ?, 
            win_margin = ?,
            man_of_match_id = ?,
            is_completed = ?
         WHERE match_id = ?`,
         [
            winner_id,
            win_type,
            win_margin,
            man_of_match_id,
            is_completed,
            params.id,
         ]
      );

      if ((result as any).affectedRows === 0) {
         return NextResponse.json(
            { success: false, error: "Match not found" },
            { status: 404 }
         );
      }

      // If match is completed, update team statistics
      if (is_completed && winner_id) {
         await updateTeamStats(parseInt(params.id));
      }

      return NextResponse.json({
         success: true,
         message: "Match result updated successfully",
      });
   } catch (error) {
      console.error("Error updating match result:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to update match result",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// Helper function to update team statistics after match completion
async function updateTeamStats(matchId: number) {
   try {
      // Get match details
      const [matchRows] = await pool.execute(
         `SELECT series_id, team1_id, team2_id, winner_id 
          FROM Matches WHERE match_id = ?`,
         [matchId]
      );

      if ((matchRows as any[]).length === 0) return;

      const match = (matchRows as any[])[0];
      const { series_id, team1_id, team2_id, winner_id } = match;

      // Update stats for both teams
      for (const teamId of [team1_id, team2_id]) {
         const isWinner = teamId === winner_id;
         const isLoser = winner_id && teamId !== winner_id;

         // Check if team stats record exists
         const [existingStats] = await pool.execute(
            `SELECT * FROM TeamStats WHERE team_id = ? AND series_id = ?`,
            [teamId, series_id]
         );

         if ((existingStats as any[]).length === 0) {
            // Create new team stats record
            await pool.execute(
               `INSERT INTO TeamStats (team_id, series_id, matches_played, matches_won, matches_lost, points)
                VALUES (?, ?, 1, ?, ?, ?)`,
               [
                  teamId,
                  series_id,
                  isWinner ? 1 : 0,
                  isLoser ? 1 : 0,
                  isWinner ? 2 : 0,
               ]
            );
         } else {
            // Update existing team stats
            await pool.execute(
               `UPDATE TeamStats SET 
                  matches_played = matches_played + 1,
                  matches_won = matches_won + ?,
                  matches_lost = matches_lost + ?,
                  points = points + ?
                WHERE team_id = ? AND series_id = ?`,
               [
                  isWinner ? 1 : 0,
                  isLoser ? 1 : 0,
                  isWinner ? 2 : 0,
                  teamId,
                  series_id,
               ]
            );
         }
      }

      console.log(`Updated team stats for match ${matchId}`);
   } catch (error) {
      console.error("Error updating team stats:", error);
   }
}
