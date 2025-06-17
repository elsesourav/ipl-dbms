import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/search/global - Global search across all entities
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
      const results: any = {
         players: [],
         teams: [],
         matches: [],
         stadiums: [],
      };

      // Search players
      const playersQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        p.batting_style,
        p.bowling_style,
        t.team_name,
        t.team_code,
        'player' as entity_type
      FROM players p
      LEFT JOIN teams t ON p.current_team_id = t.team_id
      WHERE (p.player_name LIKE ? OR p.role LIKE ?)
        AND p.is_active = true
      ORDER BY p.player_name
      LIMIT ?
    `;

      const [players] = await pool.execute(playersQuery, [
         searchTerm,
         searchTerm,
         limit,
      ]);
      results.players = players;

      // Search teams
      const teamsQuery = `
      SELECT 
        team_id,
        team_name,
        team_code,
        city,
        founded_year,
        'team' as entity_type
      FROM teams
      WHERE (team_name LIKE ? OR team_code LIKE ? OR city LIKE ?)
        AND is_active = true
      ORDER BY team_name
      LIMIT ?
    `;

      const [teams] = await pool.execute(teamsQuery, [
         searchTerm,
         searchTerm,
         searchTerm,
         limit,
      ]);
      results.teams = teams;

      // Search matches (by teams, venue, or date)
      const matchesQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.match_time,
        m.status,
        m.result,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        s.stadium_name,
        s.city,
        se.season,
        'match' as entity_type
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      JOIN series se ON m.series_id = se.series_id
      WHERE (t1.team_name LIKE ? OR t2.team_name LIKE ? 
             OR s.stadium_name LIKE ? OR s.city LIKE ?
             OR se.series_name LIKE ?)
      ORDER BY m.match_date DESC
      LIMIT ?
    `;

      const [matches] = await pool.execute(matchesQuery, [
         searchTerm,
         searchTerm,
         searchTerm,
         searchTerm,
         searchTerm,
         limit,
      ]);
      results.matches = matches;

      // Search stadiums
      const stadiumsQuery = `
      SELECT 
        stadium_id,
        stadium_name,
        city,
        country,
        capacity,
        'stadium' as entity_type
      FROM stadiums
      WHERE (stadium_name LIKE ? OR city LIKE ? OR country LIKE ?)
        AND is_active = true
      ORDER BY stadium_name
      LIMIT ?
    `;

      const [stadiums] = await pool.execute(stadiumsQuery, [
         searchTerm,
         searchTerm,
         searchTerm,
         limit,
      ]);
      results.stadiums = stadiums;

      // Get total counts
      const totalCounts = {
         players: (results.players as any[]).length,
         teams: (results.teams as any[]).length,
         matches: (results.matches as any[]).length,
         stadiums: (results.stadiums as any[]).length,
      };

      const totalResults = Object.values(totalCounts).reduce(
         (sum, count) => sum + count,
         0
      );

      return NextResponse.json({
         success: true,
         data: {
            query: query.trim(),
            results,
            counts: totalCounts,
            total_results: totalResults,
            has_results: totalResults > 0,
         },
      });
   } catch (error) {
      console.error("Global search error:", error);
      return NextResponse.json(
         { success: false, error: "Search failed" },
         { status: 500 }
      );
   }
}
