import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../lib/db";

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

      // Get match interruptions
      const [interruptions] = await db.execute(
         `SELECT 
        mi.*,
        m.match_number,
        m.season_year,
        CONCAT(t1.name, ' vs ', t2.name) as match_title
       FROM match_interruptions mi
       JOIN matches m ON mi.match_id = m.match_id
       JOIN teams t1 ON m.team1_id = t1.team_id
       JOIN teams t2 ON m.team2_id = t2.team_id
       WHERE mi.match_id = ?
       ORDER BY mi.interruption_start`,
         [matchId]
      );

      return NextResponse.json({
         success: true,
         data: {
            match_id: matchId,
            interruptions,
         },
      });
   } catch (error) {
      console.error("Error fetching match interruptions:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
