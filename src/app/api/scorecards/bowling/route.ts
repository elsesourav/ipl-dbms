import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Create new bowling scorecard entry
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         match_id,
         player_id,
         team_id,
         overs_bowled = 0,
         runs_conceded = 0,
         wickets_taken = 0,
         maiden_overs = 0,
         wides = 0,
         no_balls = 0,
      } = body;

      const [result] = await pool.execute(
         `INSERT INTO BowlingScorecard (
            match_id, player_id, team_id, overs_bowled,
            runs_conceded, wickets_taken, maiden_overs,
            wides, no_balls
         ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
         [
            match_id,
            player_id,
            team_id,
            overs_bowled,
            runs_conceded,
            wickets_taken,
            maiden_overs,
            wides,
            no_balls,
         ]
      );

      return NextResponse.json({
         success: true,
         message: "Bowling scorecard created successfully",
         scorecard_id: (result as any).insertId,
      });
   } catch (error) {
      console.error("Error creating bowling scorecard:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to create bowling scorecard",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// Update existing bowling scorecard
export async function PUT(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         scorecard_id,
         overs_bowled,
         runs_conceded,
         wickets_taken,
         maiden_overs,
         wides,
         no_balls,
      } = body;

      const [result] = await pool.execute(
         `UPDATE BowlingScorecard SET 
            overs_bowled = ?, runs_conceded = ?, wickets_taken = ?,
            maiden_overs = ?, wides = ?, no_balls = ?
         WHERE scorecard_id = ?`,
         [
            overs_bowled,
            runs_conceded,
            wickets_taken,
            maiden_overs,
            wides,
            no_balls,
            scorecard_id,
         ]
      );

      if ((result as any).affectedRows === 0) {
         return NextResponse.json(
            { success: false, error: "Bowling scorecard not found" },
            { status: 404 }
         );
      }

      return NextResponse.json({
         success: true,
         message: "Bowling scorecard updated successfully",
      });
   } catch (error) {
      console.error("Error updating bowling scorecard:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to update bowling scorecard",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
