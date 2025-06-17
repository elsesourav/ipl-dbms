import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { season: string } }
) {
   try {
      const season = parseInt(params.season);
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const sortBy = searchParams.get("sort_by") || "wickets";
      const teamId = searchParams.get("team_id");

      if (isNaN(season)) {
         return NextResponse.json({ error: "Invalid season" }, { status: 400 });
      }

      let query = `
      SELECT 
        p.player_id,
        p.name,
        p.jersey_number,
        t.name as team_name,
        t.short_name as team_short,
        COUNT(DISTINCT m.match_id) as matches_played,
        SUM(bs.overs_bowled) as total_overs,
        SUM(bs.runs_conceded) as total_runs_conceded,
        SUM(bs.wickets_taken) as total_wickets,
        SUM(bs.maidens) as total_maidens,
        SUM(bs.no_balls) as total_no_balls,
        SUM(bs.wides) as total_wides,
        ROUND(AVG(bs.economy_rate), 2) as average_economy,
        ROUND(SUM(bs.runs_conceded) / NULLIF(SUM(bs.wickets_taken), 0), 2) as bowling_average,
        ROUND(SUM(bs.overs_bowled * 6) / NULLIF(SUM(bs.wickets_taken), 0), 2) as bowling_strike_rate,
        MAX(bs.wickets_taken) as best_figures_wickets,
        MIN(CASE WHEN bs.wickets_taken = MAX(bs.wickets_taken) THEN bs.runs_conceded END) as best_figures_runs
      FROM players p
      JOIN bowling_scorecards bs ON p.player_id = bs.player_id
      JOIN matches m ON bs.match_id = m.match_id
      JOIN teams t ON p.current_team_id = t.team_id
      WHERE m.season_year = ?
    `;

      const queryParams: any[] = [season];

      if (teamId) {
         query += ` AND p.current_team_id = ?`;
         queryParams.push(parseInt(teamId));
      }

      query += ` GROUP BY p.player_id, p.name, p.jersey_number, t.name, t.short_name`;

      // Add sorting
      switch (sortBy) {
         case "wickets":
            query += ` ORDER BY total_wickets DESC, bowling_average ASC`;
            break;
         case "economy":
            query += ` HAVING SUM(bs.overs_bowled) >= 10 ORDER BY average_economy ASC`;
            break;
         case "average":
            query += ` HAVING SUM(bs.wickets_taken) >= 5 ORDER BY bowling_average ASC`;
            break;
         case "strike_rate":
            query += ` HAVING SUM(bs.wickets_taken) >= 5 ORDER BY bowling_strike_rate ASC`;
            break;
         default:
            query += ` ORDER BY total_wickets DESC`;
      }

      query += ` LIMIT ?`;
      queryParams.push(limit);

      const [bowlingStats] = await pool.execute(query, queryParams);

      // Get season summary
      const [summary] = await pool.execute(
         `SELECT 
        COUNT(DISTINCT p.player_id) as total_bowlers,
        SUM(bs.wickets_taken) as total_wickets,
        SUM(bs.overs_bowled) as total_overs,
        SUM(bs.runs_conceded) as total_runs,
        ROUND(AVG(bs.economy_rate), 2) as average_economy
      FROM players p
      JOIN bowling_scorecards bs ON p.player_id = bs.player_id
      JOIN matches m ON bs.match_id = m.match_id
      WHERE m.season_year = ?${teamId ? " AND p.current_team_id = ?" : ""}`,
         teamId ? [season, parseInt(teamId)] : [season]
      );

      return NextResponse.json({
         success: true,
         data: {
            season,
            bowling_stats: bowlingStats,
            summary: (summary as any[])[0],
            sorted_by: sortBy,
         },
      });
   } catch (error) {
      console.error("Error fetching bowling statistics:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
