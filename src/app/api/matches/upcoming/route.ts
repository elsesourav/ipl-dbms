import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";

// GET /api/matches/upcoming - Get upcoming matches
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "20");
      const offset = parseInt(searchParams.get("offset") || "0");
      const teamId = searchParams.get("team_id");
      const days = parseInt(searchParams.get("days") || "30");

      let whereConditions = [
         "m.status = 'upcoming'",
         "m.match_date >= CURDATE()",
      ];
      let queryParams: any[] = [];

      if (teamId) {
         whereConditions.push("(m.team1_id = ? OR m.team2_id = ?)");
         queryParams.push(parseInt(teamId), parseInt(teamId));
      }

      if (days > 0) {
         whereConditions.push(
            "m.match_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)"
         );
         queryParams.push(days);
      }

      const whereClause = whereConditions.join(" AND ");

      const upcomingMatchesQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.match_time,
        m.status,
        m.match_type,
        m.overs,
        t1.team_id as team1_id,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t1.primary_color as team1_color,
        t2.team_id as team2_id,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        t2.primary_color as team2_color,
        s.stadium_name,
        s.city,
        s.country,
        se.season,
        se.series_name,
        DATEDIFF(m.match_date, CURDATE()) as days_until_match,
        TIME_TO_SEC(TIMEDIFF(CONCAT(m.match_date, ' ', m.match_time), NOW())) / 3600 as hours_until_match
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      JOIN series se ON m.series_id = se.series_id
      WHERE ${whereClause}
      ORDER BY m.match_date ASC, m.match_time ASC
      LIMIT ? OFFSET ?
    `;

      queryParams.push(limit, offset);
      const [upcomingMatches] = await pool.execute(
         upcomingMatchesQuery,
         queryParams
      );

      // Get total count for pagination
      const countQuery = `
      SELECT COUNT(*) as total 
      FROM matches m
      WHERE ${whereClause}
    `;

      const countParams = queryParams.slice(0, -2); // Remove limit and offset
      const [countResult] = await pool.execute(countQuery, countParams);
      const total = (countResult as any)[0].total;

      // Get head-to-head stats for each match
      const matchesWithH2H = await Promise.all(
         (upcomingMatches as any[]).map(async (match) => {
            const h2hQuery = `
          SELECT 
            COUNT(*) as total_matches,
            SUM(CASE 
              WHEN (m.result LIKE CONCAT(?, '%') AND ((m.team1_id = ? AND m.team2_id = ?) OR (m.team1_id = ? AND m.team2_id = ?)))
              THEN 1 ELSE 0 
            END) as team1_wins,
            SUM(CASE 
              WHEN (m.result LIKE CONCAT(?, '%') AND ((m.team1_id = ? AND m.team2_id = ?) OR (m.team1_id = ? AND m.team2_id = ?)))
              THEN 1 ELSE 0 
            END) as team2_wins
          FROM matches m
          WHERE ((m.team1_id = ? AND m.team2_id = ?) OR (m.team1_id = ? AND m.team2_id = ?))
            AND m.status = 'completed'
        `;

            const [h2hResult] = await pool.execute(h2hQuery, [
               match.team1_name,
               match.team1_id,
               match.team2_id,
               match.team2_id,
               match.team1_id,
               match.team2_name,
               match.team1_id,
               match.team2_id,
               match.team2_id,
               match.team1_id,
               match.team1_id,
               match.team2_id,
               match.team2_id,
               match.team1_id,
            ]);

            return {
               ...match,
               head_to_head: h2hResult[0],
            };
         })
      );

      // Get summary stats
      const summaryQuery = `
      SELECT 
        COUNT(*) as total_upcoming,
        COUNT(CASE WHEN DATEDIFF(match_date, CURDATE()) <= 7 THEN 1 END) as next_week,
        COUNT(CASE WHEN DATEDIFF(match_date, CURDATE()) <= 1 THEN 1 END) as tomorrow,
        MIN(match_date) as next_match_date
      FROM matches 
      WHERE status = 'upcoming' AND match_date >= CURDATE()
    `;

      const [summary] = await pool.execute(summaryQuery);

      return NextResponse.json({
         success: true,
         data: {
            matches: matchesWithH2H,
            summary: summary[0],
            pagination: {
               total,
               limit,
               offset,
               hasMore: offset + limit < total,
            },
         },
      });
   } catch (error) {
      console.error("Upcoming matches error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch upcoming matches" },
         { status: 500 }
      );
   }
}
