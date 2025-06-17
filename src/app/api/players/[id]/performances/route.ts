import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../../lib/db";

// GET /api/players/[id]/performances - Get player performance stats
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const playerId = parseInt(params.id);
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "20");
      const offset = parseInt(searchParams.get("offset") || "0");
      const season = searchParams.get("season");
      const matchType = searchParams.get("match_type");

      // Build where conditions
      let whereConditions = ["p.player_id = ?"];
      let queryParams: any[] = [playerId];

      if (season) {
         whereConditions.push("se.season = ?");
         queryParams.push(season);
      }

      if (matchType) {
         whereConditions.push("m.match_type = ?");
         queryParams.push(matchType);
      }

      const whereClause = whereConditions.join(" AND ");

      // Get player info
      const playerQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        p.batting_style,
        p.bowling_style,
        t.team_name,
        t.team_code
      FROM players p
      JOIN teams t ON p.current_team_id = t.team_id
      WHERE p.player_id = ?
    `;

      const [playerInfo] = await pool.execute(playerQuery, [playerId]);

      if ((playerInfo as any[]).length === 0) {
         return NextResponse.json(
            { success: false, error: "Player not found" },
            { status: 404 }
         );
      }

      const player = (playerInfo as any[])[0];

      // Get batting performances
      const battingPerformancesQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.status,
        m.result,
        bs.runs_scored,
        bs.balls_faced,
        bs.fours,
        bs.sixes,
        bs.dismissal_type,
        bs.batting_order,
        CASE 
          WHEN bs.balls_faced > 0 
          THEN ROUND((bs.runs_scored * 100.0) / bs.balls_faced, 2)
          ELSE 0 
        END as strike_rate,
        t_opp.team_name as opponent_team,
        t_opp.team_code as opponent_code,
        s.stadium_name,
        s.city,
        se.season,
        se.series_name
      FROM batting_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN matches m ON bs.match_id = m.match_id
      JOIN teams t_opp ON (
        CASE 
          WHEN bs.team_id = m.team1_id THEN m.team2_id 
          ELSE m.team1_id 
        END = t_opp.team_id
      )
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      JOIN series se ON m.series_id = se.series_id
      WHERE ${whereClause}
      ORDER BY m.match_date DESC
      LIMIT ? OFFSET ?
    `;

      queryParams.push(limit, offset);
      const [battingPerformances] = await pool.execute(
         battingPerformancesQuery,
         queryParams.slice()
      );

      // Get bowling performances
      const bowlingPerformancesQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.status,
        m.result,
        bow.overs_bowled,
        bow.runs_conceded,
        bow.wickets_taken,
        bow.bowling_order,
        CASE 
          WHEN bow.overs_bowled > 0 
          THEN ROUND(bow.runs_conceded / bow.overs_bowled, 2)
          ELSE 0 
        END as economy_rate,
        t_opp.team_name as opponent_team,
        t_opp.team_code as opponent_code,
        s.stadium_name,
        s.city,
        se.season,
        se.series_name
      FROM bowling_scorecards bow
      JOIN players p ON bow.player_id = p.player_id
      JOIN matches m ON bow.match_id = m.match_id
      JOIN teams t_opp ON (
        CASE 
          WHEN bow.bowling_team_id = m.team1_id THEN m.team2_id 
          ELSE m.team1_id 
        END = t_opp.team_id
      )
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      JOIN series se ON m.series_id = se.series_id
      WHERE bow.player_id = ?
      ${season ? "AND se.season = ?" : ""}
      ${matchType ? "AND m.match_type = ?" : ""}
      ORDER BY m.match_date DESC
      LIMIT ? OFFSET ?
    `;

      const bowlingParams: any[] = [playerId];
      if (season) bowlingParams.push(season);
      if (matchType) bowlingParams.push(matchType);
      bowlingParams.push(limit, offset);

      const [bowlingPerformances] = await pool.execute(
         bowlingPerformancesQuery,
         bowlingParams
      );

      // Get performance summary
      const summaryQuery = `
      SELECT 
        COUNT(DISTINCT m.match_id) as total_matches,
        COALESCE(SUM(bs.runs_scored), 0) as total_runs,
        COALESCE(MAX(bs.runs_scored), 0) as highest_score,
        COALESCE(AVG(bs.runs_scored), 0) as avg_runs,
        COALESCE(SUM(bow.wickets_taken), 0) as total_wickets,
        COALESCE(MAX(bow.wickets_taken), 0) as best_bowling,
        COALESCE(AVG(CASE WHEN bow.overs_bowled > 0 THEN bow.runs_conceded / bow.overs_bowled END), 0) as avg_economy
      FROM matches m
      LEFT JOIN batting_scorecards bs ON m.match_id = bs.match_id AND bs.player_id = ?
      LEFT JOIN bowling_scorecards bow ON m.match_id = bow.match_id AND bow.player_id = ?
      JOIN series se ON m.series_id = se.series_id
      WHERE (bs.player_id = ? OR bow.player_id = ?)
      ${season ? "AND se.season = ?" : ""}
    `;

      const summaryParams: any[] = [playerId, playerId, playerId, playerId];
      if (season) summaryParams.push(season);

      const [summary] = await pool.execute(summaryQuery, summaryParams);

      return NextResponse.json({
         success: true,
         data: {
            player,
            summary: summary[0],
            performances: {
               batting: battingPerformances,
               bowling: bowlingPerformances,
            },
            pagination: {
               limit,
               offset,
               hasMore: (battingPerformances as any[]).length === limit,
            },
         },
      });
   } catch (error) {
      console.error("Player performances error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch player performances" },
         { status: 500 }
      );
   }
}
