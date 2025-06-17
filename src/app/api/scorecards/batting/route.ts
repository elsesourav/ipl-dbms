import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Create new batting scorecard entry
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         match_id,
         player_id,
         team_id,
         batting_position,
         runs_scored = 0,
         balls_faced = 0,
         fours = 0,
         sixes = 0,
         is_out = false,
         out_type = "not_out",
         bowler_id,
         fielder_id,
      } = body;

      const [result] = await pool.execute(
         `INSERT INTO BattingScorecard (
            match_id, player_id, team_id, batting_position, 
            runs_scored, balls_faced, fours, sixes, 
            is_out, out_type, bowler_id, fielder_id
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
         [
            match_id,
            player_id,
            team_id,
            batting_position,
            runs_scored,
            balls_faced,
            fours,
            sixes,
            is_out,
            out_type,
            bowler_id,
            fielder_id,
         ]
      );

      return NextResponse.json({
         success: true,
         message: "Batting scorecard created successfully",
         scorecard_id: (result as any).insertId,
      });
   } catch (error) {
      console.error("Error creating batting scorecard:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to create batting scorecard",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// Update existing batting scorecard
export async function PUT(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         scorecard_id,
         runs_scored,
         balls_faced,
         fours,
         sixes,
         is_out,
         out_type,
         bowler_id,
         fielder_id,
      } = body;

      const [result] = await pool.execute(
         `UPDATE BattingScorecard SET 
            runs_scored = ?, balls_faced = ?, fours = ?, sixes = ?,
            is_out = ?, out_type = ?, bowler_id = ?, fielder_id = ?
         WHERE scorecard_id = ?`,
         [
            runs_scored,
            balls_faced,
            fours,
            sixes,
            is_out,
            out_type,
            bowler_id,
            fielder_id,
            scorecard_id,
         ]
      );

      if ((result as any).affectedRows === 0) {
         return NextResponse.json(
            { success: false, error: "Batting scorecard not found" },
            { status: 404 }
         );
      }

      return NextResponse.json({
         success: true,
         message: "Batting scorecard updated successfully",
      });
   } catch (error) {
      console.error("Error updating batting scorecard:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to update batting scorecard",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
