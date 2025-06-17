import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/dashboard/upcoming-fixtures - Get upcoming fixtures
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "10");
      const days = parseInt(searchParams.get("days") || "30"); // Look ahead days

      const upcomingFixturesQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.match_time,
        m.status,
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
        DATEDIFF(m.match_date, CURDATE()) as days_until_match,
        TIME_TO_SEC(TIMEDIFF(CONCAT(m.match_date, ' ', m.match_time), NOW())) / 3600 as hours_until_match
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      JOIN series se ON m.series_id = se.series_id
      WHERE m.status = 'upcoming'
        AND m.match_date >= CURDATE()
        AND m.match_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY m.match_date ASC, m.match_time ASC
      LIMIT ?
    `;

      const [fixtures] = await pool.execute(upcomingFixturesQuery, [
         days,
         limit,
      ]);

      // Get next matches count summary
      const nextMatchesQuery = `
      SELECT COUNT(*) as upcoming_count
      FROM matches 
      WHERE status = 'upcoming' AND match_date >= CURDATE()
    `;

      const [countResult] = await pool.execute(nextMatchesQuery);
      const totalUpcoming = (countResult as any)[0].upcoming_count;

      return NextResponse.json({
         success: true,
         data: {
            fixtures,
            summary: {
               total_upcoming: totalUpcoming,
               next_7_days: (fixtures as any[]).filter(
                  (f) => f.days_until_match <= 7
               ).length,
               next_24_hours: (fixtures as any[]).filter(
                  (f) => f.hours_until_match <= 24 && f.hours_until_match > 0
               ).length,
            },
         },
      });
   } catch (error) {
      console.error("Upcoming fixtures error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch upcoming fixtures" },
         { status: 500 }
      );
   }
}
