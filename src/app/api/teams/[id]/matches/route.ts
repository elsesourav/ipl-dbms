import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/teams/[id]/matches - Get all matches for a team
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const teamId = parseInt(params.id);

      console.log("Team matches API called for team:", teamId);

      // Get team matches - very simple query
      const matchesQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.match_status,
        t1.team_name as team1_name,
        t2.team_name as team2_name
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      WHERE (m.team1_id = ? OR m.team2_id = ?)
      ORDER BY m.match_date DESC
      LIMIT 10
    `;

      console.log("Executing query:", matchesQuery);
      const [matches] = await pool.execute(matchesQuery, [teamId, teamId]);
      console.log(
         "Found matches:",
         Array.isArray(matches) ? matches.length : "not array"
      );

      return NextResponse.json({
         success: true,
         data: {
            matches,
            count: Array.isArray(matches) ? matches.length : 0,
         },
      });
   } catch (error) {
      console.error("Error fetching team matches:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch team matches",
            details: error.message,
         },
         { status: 500 }
      );
   }
}
