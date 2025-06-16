import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET() {
   try {
      const [rows] = await db.execute(`
      SELECT 
        m.*,
        s.series_name,
        t1.team_name as team1_name,
        t2.team_name as team2_name,
        st.stadium_name as venue
      FROM Matches m
      LEFT JOIN Series s ON m.series_id = s.series_id
      LEFT JOIN Teams t1 ON m.team1_id = t1.team_id
      LEFT JOIN Teams t2 ON m.team2_id = t2.team_id
      LEFT JOIN Stadiums st ON m.stadium_id = st.stadium_id
      ORDER BY m.match_date DESC, m.match_id DESC
      LIMIT 50
    `);

      return NextResponse.json({ success: true, data: rows });
   } catch (error) {
      console.error("Error fetching matches:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch matches" },
         { status: 500 }
      );
   }
}

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         team1,
         team2,
         date,
         venue,
         match_type,
         series_id,
         winner,
         toss_winner,
         toss_decision,
         result_margin,
         match_status,
      } = body;

      // Get team IDs from team names
      let team1_id = null,
         team2_id = null;

      if (team1) {
         const [team1Rows] = await db.execute(
            "SELECT team_id FROM Teams WHERE team_name = ?",
            [team1]
         );
         if ((team1Rows as any[]).length > 0) {
            team1_id = (team1Rows as any[])[0].team_id;
         }
      }

      if (team2) {
         const [team2Rows] = await db.execute(
            "SELECT team_id FROM Teams WHERE team_name = ?",
            [team2]
         );
         if ((team2Rows as any[]).length > 0) {
            team2_id = (team2Rows as any[])[0].team_id;
         }
      }

      // Get stadium ID for venue (create a default one if not exists)
      let stadium_id = 1; // Default stadium
      if (venue) {
         const [stadiumRows] = await db.execute(
            "SELECT stadium_id FROM Stadiums WHERE stadium_name = ?",
            [venue]
         );
         if ((stadiumRows as any[]).length > 0) {
            stadium_id = (stadiumRows as any[])[0].stadium_id;
         } else {
            // Create new stadium
            const [stadiumResult] = await db.execute(
               "INSERT INTO Stadiums (stadium_name, city, capacity) VALUES (?, ?, ?)",
               [venue, "Unknown", 50000]
            );
            stadium_id = (stadiumResult as any).insertId;
         }
      }

      // Convert match_type to lowercase for enum
      const match_type_enum = match_type ? match_type.toLowerCase() : "league";

      // Insert match
      const [result] = await db.execute(
         `INSERT INTO Matches 
       (series_id, match_type, team1_id, team2_id, stadium_id, match_date, is_completed) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
         [
            series_id || 1, // Default series
            match_type_enum,
            team1_id,
            team2_id,
            stadium_id,
            date,
            match_status === "Completed",
         ]
      );

      return NextResponse.json(
         {
            success: true,
            message: "Match created successfully",
            match_id: (result as any).insertId,
         },
         { status: 201 }
      );
   } catch (error) {
      console.error("Error creating match:", error);
      return NextResponse.json(
         { success: false, error: "Failed to create match" },
         { status: 500 }
      );
   }
}
