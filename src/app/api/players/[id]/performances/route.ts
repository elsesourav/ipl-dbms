import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const playerId = parseInt(params.id);
      const { searchParams } = new URL(request.url);
      const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // Cap at 50

      if (isNaN(playerId)) {
         return NextResponse.json(
            { success: false, error: "Invalid player ID" },
            { status: 400 }
         );
      }

      if (isNaN(limit) || limit < 1) {
         return NextResponse.json(
            { success: false, error: "Invalid limit parameter" },
            { status: 400 }
         );
      }

      const [rows] = await pool.execute(
         `SELECT 
        m.match_id,
        m.match_date,
        s.stadium_name as venue,
        CASE 
          WHEN m.team1_id = p.team_id THEN t2.team_name
          ELSE t1.team_name
        END as opponent_team,
        bs.runs_scored,
        bs.balls_faced,
        bs.fours,
        bs.sixes,
        bs.strike_rate,
        bs.is_out,
        bs.out_type,
        bow.wickets_taken,
        bow.overs_bowled,
        bow.runs_conceded,
        bow.economy_rate
      FROM Players p
      JOIN Matches m ON (m.team1_id = p.team_id OR m.team2_id = p.team_id)
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      LEFT JOIN Stadiums s ON m.stadium_id = s.stadium_id
      LEFT JOIN BattingScorecard bs ON bs.match_id = m.match_id AND bs.player_id = p.player_id
      LEFT JOIN BowlingScorecard bow ON bow.match_id = m.match_id AND bow.player_id = p.player_id
      WHERE p.player_id = ? AND m.is_completed = TRUE
        AND (bs.player_id IS NOT NULL OR bow.player_id IS NOT NULL)
      ORDER BY m.match_date DESC
      LIMIT ${limit}`,
         [playerId]
      );

      return NextResponse.json({
         success: true,
         data: rows,
         count: (rows as any[]).length,
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch player performances",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
