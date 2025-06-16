import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const teamId = parseInt(params.id);
      const { searchParams } = new URL(request.url);
      const limit = Math.min(parseInt(searchParams.get("limit") || "10"), 50); // Cap at 50

      if (isNaN(teamId)) {
         return NextResponse.json(
            { success: false, error: "Invalid team ID" },
            { status: 400 }
         );
      }

      if (isNaN(limit) || limit < 1) {
         return NextResponse.json(
            { success: false, error: "Invalid limit parameter" },
            { status: 400 }
         );
      }

      console.log(`Fetching matches for team ${teamId} with limit ${limit}`);

      // Use parameterized query but handle LIMIT separately for MySQL compatibility
      const [rows] = await db.execute(
         `SELECT 
            m.match_id,
            m.match_date,
            m.match_type,
            m.is_completed,
            m.winner_id,
            m.win_type,
            m.win_margin,
            CASE 
               WHEN m.team1_id = ? THEN t2.team_name
               ELSE t1.team_name
            END as opponent,
            CASE 
               WHEN m.winner_id = ? THEN 'Won'
               WHEN m.winner_id IS NULL AND m.is_completed = 1 THEN 'No Result'
               WHEN m.is_completed = 1 THEN 'Lost'
               ELSE 'Upcoming'
            END as result,
            st.stadium_name as venue,
            st.city as venue_city
         FROM Matches m
         LEFT JOIN Teams t1 ON m.team1_id = t1.team_id
         LEFT JOIN Teams t2 ON m.team2_id = t2.team_id
         LEFT JOIN Stadiums st ON m.stadium_id = st.stadium_id
         WHERE (m.team1_id = ? OR m.team2_id = ?) AND m.is_completed = TRUE
         ORDER BY m.match_date DESC
         LIMIT ${limit}`,
         [teamId, teamId, teamId, teamId]
      );

      console.log(`Found ${(rows as any[]).length} matches for team ${teamId}`);

      return NextResponse.json({
         success: true,
         data: rows,
         count: (rows as any[]).length,
      });
   } catch (error) {
      console.error("Error fetching team matches:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch team matches",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
