import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../../lib/db";

// GET /api/teams/[id]/matches - Get all matches for a team
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const teamId = parseInt(params.id);
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const status = searchParams.get("status");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Check if team exists
      const teamQuery = `
      SELECT team_id, team_name, team_code
      FROM teams 
      WHERE team_id = ? AND is_active = true
    `;

      const [teamInfo] = await pool.execute(teamQuery, [teamId]);

      if ((teamInfo as any[]).length === 0) {
         return NextResponse.json(
            { success: false, error: "Team not found" },
            { status: 404 }
         );
      }

      const team = (teamInfo as any[])[0];

      // Build where conditions
      let whereConditions = ["(m.team1_id = ? OR m.team2_id = ?)"];
      let queryParams: any[] = [teamId, teamId];

      if (season) {
         whereConditions.push("se.season = ?");
         queryParams.push(season);
      }

      if (status) {
         whereConditions.push("m.status = ?");
         queryParams.push(status);
      }

      const whereClause = whereConditions.join(" AND ");

      // Get team matches
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
          WHEN m.team1_id = ? THEN t2.team_name
          ELSE t1.team_name
        END as opponent_name,
        CASE 
          WHEN m.team1_id = ? THEN t2.team_code
          ELSE t1.team_code
        END as opponent_code,
        CASE 
          WHEN m.result LIKE CONCAT(?, '%') THEN 'Won'
          WHEN m.result LIKE '%tie%' OR m.result LIKE '%tied%' THEN 'Tied'
          WHEN m.result LIKE '%no result%' THEN 'No Result'
          WHEN m.status = 'completed' THEN 'Lost'
          ELSE m.status
        END as match_result
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      JOIN series se ON m.series_id = se.series_id
      WHERE ${whereClause}
      ORDER BY m.match_date DESC, m.match_time DESC
      LIMIT ? OFFSET ?
    `;

      const allParams = [
         ...queryParams,
         teamId,
         teamId,
         team.team_name,
         limit,
         offset,
      ];
      const [matches] = await pool.execute(matchesQuery, allParams);

      // Get total count for pagination
      const countQuery = `
      SELECT COUNT(*) as total 
      FROM matches m
      JOIN series se ON m.series_id = se.series_id
      WHERE ${whereClause}
    `;

      const [countResult] = await pool.execute(countQuery, queryParams);
      const total = (countResult as any)[0].total;

      // Get match statistics summary
      const statsQuery = `
      SELECT 
        COUNT(*) as total_matches,
        SUM(CASE 
          WHEN m.result LIKE CONCAT(?, '%') THEN 1 
          ELSE 0 
        END) as matches_won,
        SUM(CASE 
          WHEN m.result LIKE '%tie%' OR m.result LIKE '%tied%' THEN 1 
          ELSE 0 
        END) as matches_tied,
        SUM(CASE 
          WHEN m.result LIKE '%no result%' THEN 1 
          ELSE 0 
        END) as matches_no_result,
        COUNT(CASE WHEN m.status = 'completed' THEN 1 END) as completed_matches,
        COUNT(CASE WHEN m.status = 'upcoming' THEN 1 END) as upcoming_matches,
        COUNT(CASE WHEN m.status = 'live' THEN 1 END) as live_matches
      FROM matches m
      JOIN series se ON m.series_id = se.series_id
      WHERE ${whereClause}
    `;

      const statsParams = [team.team_name, ...queryParams];
      const [matchStats] = await pool.execute(statsQuery, statsParams);

      const stats = (matchStats as any[])[0];
      stats.matches_lost =
         stats.completed_matches -
         stats.matches_won -
         stats.matches_tied -
         stats.matches_no_result;

      return NextResponse.json({
         success: true,
         data: {
            team,
            matches,
            statistics: stats,
            pagination: {
               total,
               limit,
               offset,
               hasMore: offset + limit < total,
            },
            filters: { season, status },
         },
      });
   } catch (error) {
      console.error("Team matches error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch team matches" },
         { status: 500 }
      );
   }
}
