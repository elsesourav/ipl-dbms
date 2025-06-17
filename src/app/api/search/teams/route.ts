import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/search/teams - Search teams
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q");
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

      const teamsQuery = `
      SELECT 
        t.team_id,
        t.team_name,
        t.team_code,
        t.city,
        t.founded_year,
        t.primary_color,
        t.secondary_color,
        t.is_active,
        COUNT(p.player_id) as total_players
      FROM teams t
      LEFT JOIN players p ON t.team_id = p.current_team_id AND p.is_active = true
      WHERE (t.team_name LIKE ? OR t.team_code LIKE ? OR t.city LIKE ?)
        AND t.is_active = true
      GROUP BY t.team_id, t.team_name, t.team_code, t.city, t.founded_year, 
               t.primary_color, t.secondary_color, t.is_active
      ORDER BY t.team_name
      LIMIT ?
    `;

      const [teams] = await pool.execute(teamsQuery, [
         searchTerm,
         searchTerm,
         searchTerm,
         limit,
      ]);

      // Get stats for each team
      const teamsWithStats = await Promise.all(
         (teams as any[]).map(async (team) => {
            const statsQuery = `
          SELECT 
            ts.matches_played,
            ts.matches_won,
            ts.matches_lost,
            ts.points,
            ts.net_run_rate,
            ts.season,
            se.series_name
          FROM team_stats ts
          JOIN series se ON ts.season = se.season
          WHERE ts.team_id = ?
          ORDER BY ts.season DESC
          LIMIT 1
        `;

            const [stats] = await pool.execute(statsQuery, [team.team_id]);

            return {
               ...team,
               current_season_stats: (stats as any[])[0] || null,
            };
         })
      );

      return NextResponse.json({
         success: true,
         data: {
            teams: teamsWithStats,
            total_results: teamsWithStats.length,
            search_query: query.trim(),
         },
      });
   } catch (error) {
      console.error("Team search error:", error);
      return NextResponse.json(
         { success: false, error: "Team search failed" },
         { status: 500 }
      );
   }
}
