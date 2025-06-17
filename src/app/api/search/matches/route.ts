import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/search/matches - Search matches
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q");
      const status = searchParams.get("status");
      const team = searchParams.get("team");
      const venue = searchParams.get("venue");
      const limit = parseInt(searchParams.get("limit") || "20");

      if (!query || query.trim().length < 2) {
         return NextResponse.json(
            {
               success: false,
               error: "Search query must be at least 2 characters",
            },
            { status: 400 }
         );
      }

      const searchTerm = `%${query.trim()}%`;
      let whereConditions = [
         "(t1.team_name LIKE ? OR t2.team_name LIKE ? OR s.stadium_name LIKE ? OR s.city LIKE ? OR se.series_name LIKE ?)",
      ];
      let queryParams: any[] = [
         searchTerm,
         searchTerm,
         searchTerm,
         searchTerm,
         searchTerm,
      ];

      if (status) {
         whereConditions.push("m.status = ?");
         queryParams.push(status);
      }

      if (team) {
         whereConditions.push(
            "(t1.team_name LIKE ? OR t2.team_name LIKE ? OR t1.team_code LIKE ? OR t2.team_code LIKE ?)"
         );
         const teamSearch = `%${team}%`;
         queryParams.push(teamSearch, teamSearch, teamSearch, teamSearch);
      }

      if (venue) {
         whereConditions.push("(s.stadium_name LIKE ? OR s.city LIKE ?)");
         const venueSearch = `%${venue}%`;
         queryParams.push(venueSearch, venueSearch);
      }

      const whereClause = whereConditions.join(" AND ");

      const matchesQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.match_time,
        m.status,
        m.result,
        m.match_type,
        m.overs,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t1.primary_color as team1_color,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        t2.primary_color as team2_color,
        s.stadium_name,
        s.city,
        s.country,
        se.season,
        se.series_name,
        CASE 
          WHEN m.result LIKE '%won by%' THEN 
            CASE 
              WHEN m.result LIKE CONCAT(t1.team_name, '%') THEN t1.team_name
              WHEN m.result LIKE CONCAT(t2.team_name, '%') THEN t2.team_name
              ELSE NULL
            END
          ELSE NULL
        END as winner_name
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      JOIN series se ON m.series_id = se.series_id
      WHERE ${whereClause}
      ORDER BY m.match_date DESC, m.match_time DESC
      LIMIT ?
    `;

      queryParams.push(limit);
      const [matches] = await pool.execute(matchesQuery, queryParams);

      // Get score summaries for completed matches
      const matchesWithScores = await Promise.all(
         (matches as any[]).map(async (match) => {
            if (match.status === "completed") {
               const scoresQuery = `
            SELECT 
              bs.team_id,
              SUM(bs.runs_scored) as total_runs,
              COUNT(CASE WHEN bs.dismissal_type != 'not out' AND bs.dismissal_type IS NOT NULL THEN 1 END) as wickets_lost
            FROM batting_scorecards bs
            WHERE bs.match_id = ?
            GROUP BY bs.team_id
          `;

               const [scores] = await pool.execute(scoresQuery, [
                  match.match_id,
               ]);

               return {
                  ...match,
                  scores: scores,
               };
            }
            return match;
         })
      );

      return NextResponse.json({
         success: true,
         data: {
            matches: matchesWithScores,
            total_results: matchesWithScores.length,
            search_query: query.trim(),
            filters: { status, team, venue },
         },
      });
   } catch (error) {
      console.error("Match search error:", error);
      return NextResponse.json(
         { success: false, error: "Match search failed" },
         { status: 500 }
      );
   }
}
