import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const matchId = parseInt(params.id);
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const offset = (page - 1) * limit;

      if (isNaN(matchId)) {
         return NextResponse.json(
            { error: "Invalid match ID" },
            { status: 400 }
         );
      }

      // Get match commentary
      const [commentary] = await db.execute(
         `SELECT 
        mc.*,
        p.name as player_name,
        t.name as team_name,
        t.short_name as team_short_name
       FROM match_commentary mc
       LEFT JOIN players p ON mc.player_id = p.player_id
       LEFT JOIN teams t ON mc.team_id = t.team_id
       WHERE mc.match_id = ?
       ORDER BY mc.innings_number DESC, mc.over_number DESC, mc.ball_number DESC, mc.comment_timestamp DESC
       LIMIT ? OFFSET ?`,
         [matchId, limit, offset]
      );

      // Get total count for pagination
      const [countResult] = await db.execute(
         `SELECT COUNT(*) as total FROM match_commentary WHERE match_id = ?`,
         [matchId]
      );

      const total = (countResult as any[])[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
         success: true,
         data: {
            match_id: matchId,
            commentary,
            pagination: {
               current_page: page,
               total_pages: totalPages,
               total_items: total,
               items_per_page: limit,
            },
         },
      });
   } catch (error) {
      console.error("Error fetching match commentary:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
