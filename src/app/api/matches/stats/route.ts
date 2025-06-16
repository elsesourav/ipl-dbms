import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const type = searchParams.get("type") || "recent"; // recent, upcoming, completed
      const limit = parseInt(searchParams.get("limit") || "10");
      const seriesId = searchParams.get("series_id");
      const teamId = searchParams.get("team_id");

      let whereConditions = [];
      let params: any[] = [];

      if (seriesId) {
         whereConditions.push("m.series_id = ?");
         params.push(seriesId);
      }

      if (teamId) {
         whereConditions.push("(m.team1_id = ? OR m.team2_id = ?)");
         params.push(teamId, teamId);
      }

      const whereClause =
         whereConditions.length > 0
            ? "WHERE " + whereConditions.join(" AND ")
            : "";

      if (type === "recent" || type === "completed") {
         // Get recent/completed matches
         const additionalFilter =
            type === "completed"
               ? whereClause
                  ? " AND m.is_completed = TRUE"
                  : "WHERE m.is_completed = TRUE"
               : "";

         const [matches] = await pool.execute(
            `
            SELECT 
               m.match_id,
               m.match_number,
               m.match_date,
               m.match_time,
               m.match_type,
               m.is_completed,
               s.series_name,
               s.season_year,
               t1.team_name as team1_name,
               t1.team_code as team1_code,
               t1.team_color as team1_color,
               t2.team_name as team2_name,
               t2.team_code as team2_code,
               t2.team_color as team2_color,
               tw.team_name as winner_name,
               tw.team_code as winner_code,
               toss.team_name as toss_winner_name,
               m.toss_decision,
               m.win_type,
               m.win_margin,
               st.stadium_name,
               st.city,
               st.state,
               mom.player_name as man_of_match,
               u1.umpire_name as umpire1,
               u2.umpire_name as umpire2
            FROM Matches m
            LEFT JOIN Series s ON m.series_id = s.series_id
            LEFT JOIN Teams t1 ON m.team1_id = t1.team_id
            LEFT JOIN Teams t2 ON m.team2_id = t2.team_id
            LEFT JOIN Teams tw ON m.winner_id = tw.team_id
            LEFT JOIN Teams toss ON m.toss_winner_id = toss.team_id
            LEFT JOIN Stadiums st ON m.stadium_id = st.stadium_id
            LEFT JOIN Players mom ON m.man_of_match_id = mom.player_id
            LEFT JOIN Umpires u1 ON m.umpire1_id = u1.umpire_id
            LEFT JOIN Umpires u2 ON m.umpire2_id = u2.umpire_id
            ${whereClause}${additionalFilter}
            ORDER BY m.match_date DESC, m.match_id DESC
            LIMIT ?
         `,
            [...params, limit]
         );

         return NextResponse.json({
            success: true,
            data: matches,
         });
      }

      if (type === "upcoming") {
         // Get upcoming matches
         const additionalFilter = whereClause
            ? " AND (m.is_completed = FALSE OR m.is_completed IS NULL)"
            : "WHERE (m.is_completed = FALSE OR m.is_completed IS NULL)";

         const [matches] = await pool.execute(
            `
            SELECT 
               m.match_id,
               m.match_number,
               m.match_date,
               m.match_time,
               m.match_type,
               m.is_completed,
               s.series_name,
               s.season_year,
               t1.team_name as team1_name,
               t1.team_code as team1_code,
               t1.team_color as team1_color,
               t2.team_name as team2_name,
               t2.team_code as team2_code,
               t2.team_color as team2_color,
               st.stadium_name,
               st.city,
               st.state
            FROM Matches m
            LEFT JOIN Series s ON m.series_id = s.series_id
            LEFT JOIN Teams t1 ON m.team1_id = t1.team_id
            LEFT JOIN Teams t2 ON m.team2_id = t2.team_id
            LEFT JOIN Stadiums st ON m.stadium_id = st.stadium_id
            ${whereClause}${additionalFilter}
            ORDER BY m.match_date ASC, m.match_id ASC
            LIMIT ?
         `,
            [...params, limit]
         );

         return NextResponse.json({
            success: true,
            data: matches,
         });
      }

      // Get match statistics summary
      const [summary] = await pool.execute(
         `
         SELECT 
            COUNT(*) as total_matches,
            COUNT(CASE WHEN m.is_completed = TRUE THEN 1 END) as completed_matches,
            COUNT(CASE WHEN m.is_completed = FALSE OR m.is_completed IS NULL THEN 1 END) as upcoming_matches,
            COUNT(CASE WHEN m.match_type = 'final' THEN 1 END) as finals,
            COUNT(CASE WHEN m.match_type = 'qualifier1' OR m.match_type = 'qualifier2' THEN 1 END) as qualifiers,
            COUNT(CASE WHEN m.match_type = 'eliminator' THEN 1 END) as eliminators,
            COUNT(CASE WHEN m.match_type = 'league' THEN 1 END) as league_matches
         FROM Matches m
         ${whereClause}
      `,
         params
      );

      // Get venue statistics
      const [venueStats] = await pool.execute(
         `
         SELECT 
            st.stadium_name,
            st.city,
            st.state,
            COUNT(m.match_id) as matches_hosted,
            COUNT(CASE WHEN m.is_completed = TRUE THEN 1 END) as completed_matches
         FROM Stadiums st
         LEFT JOIN Matches m ON st.stadium_id = m.stadium_id
         ${whereClause.replace("m.", "m.")}
         GROUP BY st.stadium_id, st.stadium_name, st.city, st.state
         HAVING matches_hosted > 0
         ORDER BY matches_hosted DESC
         LIMIT 10
      `,
         params
      );

      return NextResponse.json({
         success: true,
         data: {
            summary: (summary as RowDataPacket[])[0],
            venueStats: venueStats,
         },
      });
   } catch (error) {
      console.error("Error fetching match statistics:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch match statistics" },
         { status: 500 }
      );
   }
}
