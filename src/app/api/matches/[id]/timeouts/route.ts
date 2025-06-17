import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const matchId = parseInt(params.id);

      if (isNaN(matchId)) {
         return NextResponse.json(
            { error: "Invalid match ID" },
            { status: 400 }
         );
      }

      // Get strategic timeouts for the match
      const [timeouts] = await pool.execute(
         `SELECT 
        st.*,
        t.name as team_name,
        t.short_name as team_short_name,
        m.match_number,
        m.season_year
       FROM strategic_timeouts st
       JOIN teams t ON st.team_id = t.team_id
       JOIN matches m ON st.match_id = m.match_id
       WHERE st.match_id = ?
       ORDER BY st.innings_number, st.timeout_over, st.timeout_ball`,
         [matchId]
      );

      return NextResponse.json({
         success: true,
         data: {
            match_id: matchId,
            timeouts,
         },
      });
   } catch (error) {
      console.error("Error fetching strategic timeouts:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
