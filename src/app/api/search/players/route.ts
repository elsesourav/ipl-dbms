import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/search/players - Search players
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q");
      const role = searchParams.get("role");
      const team = searchParams.get("team");
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
      let whereConditions = ["(p.player_name LIKE ? OR p.role LIKE ?)"];
      let queryParams: any[] = [searchTerm, searchTerm];

      if (role) {
         whereConditions.push("p.role = ?");
         queryParams.push(role);
      }

      if (team) {
         whereConditions.push("(t.team_name LIKE ? OR t.team_code LIKE ?)");
         queryParams.push(`%${team}%`, `%${team}%`);
      }

      const whereClause = whereConditions.join(" AND ");

      const playersQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        p.batting_style,
        p.bowling_style,
        p.nationality,
        t.team_name,
        t.team_code,
        t.primary_color,
        TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
        p.is_active
      FROM players p
      LEFT JOIN teams t ON p.current_team_id = t.team_id
      WHERE ${whereClause}
        AND p.is_active = true
      ORDER BY p.player_name
      LIMIT ?
    `;

      queryParams.push(limit);
      const [players] = await pool.execute(playersQuery, queryParams);

      // Get quick stats for each player
      const playersWithStats = await Promise.all(
         (players as any[]).map(async (player) => {
            const statsQuery = `
          SELECT 
            COUNT(DISTINCT bs.match_id) as matches_played,
            COALESCE(SUM(bs.runs_scored), 0) as total_runs,
            COALESCE(AVG(bs.runs_scored), 0) as avg_runs,
            COALESCE(SUM(bow.wickets_taken), 0) as total_wickets,
            COALESCE(AVG(CASE WHEN bow.overs_bowled > 0 THEN bow.runs_conceded / bow.overs_bowled END), 0) as economy_rate
          FROM players p
          LEFT JOIN batting_scorecards bs ON p.player_id = bs.player_id
          LEFT JOIN bowling_scorecards bow ON p.player_id = bow.player_id
          LEFT JOIN matches m ON (bs.match_id = m.match_id OR bow.match_id = m.match_id)
          WHERE p.player_id = ? AND (m.status = 'completed' OR m.status IS NULL)
          GROUP BY p.player_id
        `;

            const [stats] = await pool.execute(statsQuery, [player.player_id]);

            return {
               ...player,
               stats: (stats as any[])[0] || {
                  matches_played: 0,
                  total_runs: 0,
                  avg_runs: 0,
                  total_wickets: 0,
                  economy_rate: 0,
               },
            };
         })
      );

      return NextResponse.json({
         success: true,
         data: {
            players: playersWithStats,
            total_results: playersWithStats.length,
            search_query: query.trim(),
            filters: { role, team },
         },
      });
   } catch (error) {
      console.error("Player search error:", error);
      return NextResponse.json(
         { success: false, error: "Player search failed" },
         { status: 500 }
      );
   }
}
