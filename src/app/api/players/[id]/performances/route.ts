import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const playerId = params.id;
      const { searchParams } = new URL(request.url);
      const limit = searchParams.get("limit") || "10";

      const [rows] = await pool.execute(
         `SELECT 
        m.match_id,
        m.match_date,
        CASE 
          WHEN m.team1_id = p.team_id THEN t2.team_name
          ELSE t1.team_name
        END as opponent,
        bs.runs_scored,
        bs.balls_faced,
        bow.wickets_taken,
        bow.overs_bowled,
        bow.runs_conceded
      FROM Players p
      JOIN Matches m ON (m.team1_id = p.team_id OR m.team2_id = p.team_id)
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      LEFT JOIN BattingScorecard bs ON bs.match_id = m.match_id AND bs.player_id = p.player_id
      LEFT JOIN BowlingScorecard bow ON bow.match_id = m.match_id AND bow.player_id = p.player_id
      WHERE p.player_id = ? AND m.is_completed = TRUE
      ORDER BY m.match_date DESC
      LIMIT ?`,
         [playerId, parseInt(limit)]
      );

      return NextResponse.json(rows);
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
