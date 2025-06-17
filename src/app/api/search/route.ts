import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/search - Global search across players, teams, matches
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const query = searchParams.get("q");
      const type = searchParams.get("type"); // 'players', 'teams', 'matches', or 'all'
      const limit = parseInt(searchParams.get("limit") || "20");

      if (!query || query.trim().length < 2) {
         return NextResponse.json(
            {
               success: false,
               error: "Search query must be at least 2 characters long",
            },
            { status: 400 }
         );
      }

      const searchTerm = `%${query.trim()}%`;
      const results: any = {
         players: [],
         teams: [],
         matches: [],
         total: 0,
      };

      // Search players
      if (!type || type === "players" || type === "all") {
         const playersQuery = `
        SELECT 
          p.player_id,
          p.player_name,
          p.role,
          p.nationality,
          p.batting_style,
          p.bowling_style,
          'player' as result_type,
          -- Current team info
          pc.team_id as current_team_id,
          t.team_name as current_team,
          t.team_code as current_team_code,
          s.season_year as current_season,
          -- Career stats
          COALESCE(ps.runs_scored, 0) as career_runs,
          COALESCE(ps.wickets_taken, 0) as career_wickets,
          COALESCE(ps.matches_played, 0) as career_matches
        FROM Players p
        LEFT JOIN PlayerContracts pc ON p.player_id = pc.player_id 
        LEFT JOIN Teams t ON pc.team_id = t.team_id
        LEFT JOIN Series s ON pc.series_id = s.series_id AND s.season_year = (
          SELECT MAX(season_year) FROM Series s2 
          JOIN PlayerContracts pc2 ON s2.series_id = pc2.series_id 
          WHERE pc2.player_id = p.player_id
        )
        LEFT JOIN PlayerStats ps ON p.player_id = ps.player_id AND ps.series_id = s.series_id
        WHERE p.player_name LIKE ? AND p.is_active = TRUE
        ORDER BY p.player_name
        LIMIT ?
      `;
         const [players] = await pool.execute<RowDataPacket[]>(playersQuery, [
            searchTerm,
            limit,
         ]);
         results.players = players;
      }

      // Search teams
      if (!type || type === "teams" || type === "all") {
         const teamsQuery = `
        SELECT 
          t.team_id,
          t.team_name,
          t.team_code,
          t.city,
          t.founded_year,
          t.owner,
          t.coach,
          t.home_ground,
          t.team_color,
          'team' as result_type,
          -- Current season stats
          ts.matches_played,
          ts.matches_won,
          ts.points,
          ts.net_run_rate,
          -- Player count
          COUNT(DISTINCT pc.player_id) as squad_size
        FROM Teams t
        LEFT JOIN TeamStats ts ON t.team_id = ts.team_id AND ts.series_id = (
          SELECT series_id FROM Series WHERE season_year = (SELECT MAX(season_year) FROM Series)
        )
        LEFT JOIN PlayerContracts pc ON t.team_id = pc.team_id AND pc.series_id = (
          SELECT series_id FROM Series WHERE season_year = (SELECT MAX(season_year) FROM Series)
        )
        WHERE (t.team_name LIKE ? OR t.team_code LIKE ? OR t.city LIKE ?) 
        AND t.is_active = TRUE
        GROUP BY t.team_id, t.team_name, t.team_code, t.city, t.founded_year, 
                 t.owner, t.coach, t.home_ground, t.team_color,
                 ts.matches_played, ts.matches_won, ts.points, ts.net_run_rate
        ORDER BY t.team_name
        LIMIT ?
      `;
         const [teams] = await pool.execute<RowDataPacket[]>(teamsQuery, [
            searchTerm,
            searchTerm,
            searchTerm,
            limit,
         ]);
         results.teams = teams;
      }

      // Search matches
      if (!type || type === "matches" || type === "all") {
         const matchesQuery = `
        SELECT 
          m.match_id,
          m.match_number,
          m.match_date,
          m.match_time,
          m.match_type,
          m.match_status,
          'match' as result_type,
          -- Teams
          t1.team_name as team1_name,
          t1.team_code as team1_code,
          t2.team_name as team2_name,
          t2.team_code as team2_code,
          -- Venue
          st.stadium_name,
          st.city as venue_city,
          -- Result
          w.team_name as winner_name,
          w.team_code as winner_code,
          m.win_type,
          m.win_margin,
          -- Season
          s.season_year,
          s.series_name
        FROM Matches m
        JOIN Teams t1 ON m.team1_id = t1.team_id
        JOIN Teams t2 ON m.team2_id = t2.team_id
        JOIN Stadiums st ON m.stadium_id = st.stadium_id
        JOIN Series s ON m.series_id = s.series_id
        LEFT JOIN Teams w ON m.winner_id = w.team_id
        WHERE (t1.team_name LIKE ? OR t2.team_name LIKE ? 
               OR st.stadium_name LIKE ? OR st.city LIKE ?
               OR s.series_name LIKE ?)
        ORDER BY m.match_date DESC
        LIMIT ?
      `;
         const [matches] = await pool.execute<RowDataPacket[]>(matchesQuery, [
            searchTerm,
            searchTerm,
            searchTerm,
            searchTerm,
            searchTerm,
            limit,
         ]);
         results.matches = matches;
      }

      results.total =
         results.players.length + results.teams.length + results.matches.length;

      return NextResponse.json({
         success: true,
         query: query,
         results: results,
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Search failed",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
