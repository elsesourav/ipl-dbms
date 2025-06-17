import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/stats/players - Get aggregated player statistics
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const category = searchParams.get("category"); // 'overview', 'batting', 'bowling', 'fielding'
      const role = searchParams.get("role");
      const teamId = searchParams.get("team_id");
      const limit = parseInt(searchParams.get("limit") || "50");

      let whereClause = "WHERE m.status = 'completed'";
      let queryParams: any[] = [];

      if (season) {
         whereClause += " AND se.season = ?";
         queryParams.push(season);
      }

      if (role) {
         whereClause += " AND p.role = ?";
         queryParams.push(role);
      }

      if (teamId) {
         whereClause += " AND bs.team_id = ?";
         queryParams.push(parseInt(teamId));
      }

      let responseData: any = {};

      // Overview statistics
      if (!category || category === "overview") {
         const overviewQuery = `
        SELECT 
          COUNT(DISTINCT p.player_id) as total_players,
          COUNT(DISTINCT CASE WHEN p.role = 'Batsman' THEN p.player_id END) as batsmen,
          COUNT(DISTINCT CASE WHEN p.role = 'Bowler' THEN p.player_id END) as bowlers,
          COUNT(DISTINCT CASE WHEN p.role = 'All-Rounder' THEN p.player_id END) as all_rounders,
          COUNT(DISTINCT CASE WHEN p.role = 'Wicket-Keeper' THEN p.player_id END) as wicket_keepers,
          COUNT(DISTINCT CASE WHEN p.nationality = 'India' THEN p.player_id END) as indian_players,
          COUNT(DISTINCT CASE WHEN p.nationality != 'India' THEN p.player_id END) as overseas_players,
          SUM(bs.runs_scored) as total_runs_scored,
          SUM(bs.balls_faced) as total_balls_faced,
          SUM(bs.fours) as total_fours,
          SUM(bs.sixes) as total_sixes,
          COUNT(DISTINCT m.match_id) as total_matches
        FROM matches m
        LEFT JOIN series se ON m.series_id = se.series_id
        JOIN batting_scorecards bs ON m.match_id = bs.match_id
        JOIN players p ON bs.player_id = p.player_id
        ${whereClause}
      `;

         const [overview] = await pool.execute<RowDataPacket[]>(
            overviewQuery,
            queryParams
         );
         responseData.overview =
            overview && overview.length > 0 ? overview[0] : {};
      }

      // Top batting performers
      if (!category || category === "batting") {
         const battingQuery = `
        SELECT 
          p.player_id,
          p.player_name,
          p.role,
          p.nationality,
          t.team_name,
          t.team_code,
          t.primary_color,
          COUNT(DISTINCT m.match_id) as matches_played,
          SUM(bs.runs_scored) as total_runs,
          SUM(bs.balls_faced) as total_balls,
          SUM(bs.fours) as total_fours,
          SUM(bs.sixes) as total_sixes,
          COUNT(CASE WHEN bs.is_out = false THEN 1 END) as not_outs,
          MAX(bs.runs_scored) as highest_score,
          COUNT(CASE WHEN bs.runs_scored >= 50 AND bs.runs_scored < 100 THEN 1 END) as fifties,
          COUNT(CASE WHEN bs.runs_scored >= 100 THEN 1 END) as hundreds,
          CASE 
            WHEN SUM(bs.balls_faced) > 0 THEN ROUND((SUM(bs.runs_scored) * 100.0) / SUM(bs.balls_faced), 2)
            ELSE 0 
          END as strike_rate,
          CASE 
            WHEN COUNT(CASE WHEN bs.is_out = true THEN 1 END) > 0 
            THEN ROUND(SUM(bs.runs_scored) / COUNT(CASE WHEN bs.is_out = true THEN 1 END), 2)
            ELSE SUM(bs.runs_scored) 
          END as batting_average
        FROM matches m
        LEFT JOIN series se ON m.series_id = se.series_id
        JOIN batting_scorecards bs ON m.match_id = bs.match_id
        JOIN players p ON bs.player_id = p.player_id
        JOIN teams t ON bs.team_id = t.team_id
        ${whereClause}
        GROUP BY p.player_id, p.player_name, p.role, p.nationality, t.team_name, t.team_code, t.primary_color
        HAVING total_runs > 0
        ORDER BY total_runs DESC, strike_rate DESC
        LIMIT ?
      `;

         const [batting] = await pool.execute<RowDataPacket[]>(battingQuery, [
            ...queryParams,
            limit,
         ]);
         responseData.batting = batting || [];
      }

      // Top bowling performers
      if (!category || category === "bowling") {
         let bowlingWhereClause = whereClause.replace(
            "bs.team_id",
            "bls.team_id"
         );

         const bowlingQuery = `
        SELECT 
          p.player_id,
          p.player_name,
          p.role,
          p.nationality,
          t.team_name,
          t.team_code,
          t.primary_color,
          COUNT(DISTINCT m.match_id) as matches_played,
          SUM(bls.overs_bowled) as total_overs,
          SUM(bls.runs_conceded) as total_runs_conceded,
          SUM(bls.wickets_taken) as total_wickets,
          SUM(bls.maiden_overs) as total_maidens,
          SUM(bls.wides) as total_wides,
          SUM(bls.no_balls) as total_no_balls,
          MAX(bls.wickets_taken) as best_bowling_figures,
          COUNT(CASE WHEN bls.wickets_taken >= 3 THEN 1 END) as three_wicket_hauls,
          COUNT(CASE WHEN bls.wickets_taken >= 5 THEN 1 END) as five_wicket_hauls,
          CASE 
            WHEN SUM(bls.overs_bowled) > 0 THEN ROUND(SUM(bls.runs_conceded) / SUM(bls.overs_bowled), 2)
            ELSE 0 
          END as economy_rate,
          CASE 
            WHEN SUM(bls.wickets_taken) > 0 THEN ROUND(SUM(bls.runs_conceded) / SUM(bls.wickets_taken), 2)
            ELSE NULL 
          END as bowling_average,
          CASE 
            WHEN SUM(bls.wickets_taken) > 0 THEN ROUND((SUM(bls.overs_bowled) * 6) / SUM(bls.wickets_taken), 2)
            ELSE NULL 
          END as strike_rate
        FROM matches m
        LEFT JOIN series se ON m.series_id = se.series_id
        JOIN bowling_scorecards bls ON m.match_id = bls.match_id
        JOIN players p ON bls.player_id = p.player_id
        JOIN teams t ON bls.team_id = t.team_id
        ${bowlingWhereClause} AND bls.overs_bowled > 0
        GROUP BY p.player_id, p.player_name, p.role, p.nationality, t.team_name, t.team_code, t.primary_color
        HAVING total_wickets > 0
        ORDER BY total_wickets DESC, economy_rate ASC
        LIMIT ?
      `;

         const bowlingParams = teamId
            ? [...queryParams.slice(0, -1), parseInt(teamId), limit]
            : [...queryParams, limit];

         const [bowling] = await pool.execute<RowDataPacket[]>(
            bowlingQuery,
            bowlingParams
         );
         responseData.bowling = bowling || [];
      }

      // Top fielding performers
      if (!category || category === "fielding") {
         const fieldingQuery = `
        SELECT 
          p.player_id,
          p.player_name,
          p.role,
          p.nationality,
          t.team_name,
          t.team_code,
          t.primary_color,
          COUNT(DISTINCT m.match_id) as matches_played,
          COUNT(CASE WHEN d.dismissal_type = 'caught' AND d.fielder_id = p.player_id THEN 1 END) as catches,
          COUNT(CASE WHEN d.dismissal_type = 'run out' AND d.fielder_id = p.player_id THEN 1 END) as run_outs,
          COUNT(CASE WHEN d.dismissal_type = 'stumped' AND d.fielder_id = p.player_id THEN 1 END) as stumpings,
          (COUNT(CASE WHEN d.dismissal_type = 'caught' AND d.fielder_id = p.player_id THEN 1 END) +
           COUNT(CASE WHEN d.dismissal_type = 'run out' AND d.fielder_id = p.player_id THEN 1 END) +
           COUNT(CASE WHEN d.dismissal_type = 'stumped' AND d.fielder_id = p.player_id THEN 1 END)) as total_dismissals
        FROM matches m
        LEFT JOIN series se ON m.series_id = se.series_id
        JOIN batting_scorecards bs ON m.match_id = bs.match_id
        JOIN players p ON bs.player_id = p.player_id
        JOIN teams t ON bs.team_id = t.team_id
        LEFT JOIN dismissals d ON bs.scorecard_id = d.scorecard_id
        ${whereClause}
        GROUP BY p.player_id, p.player_name, p.role, p.nationality, t.team_name, t.team_code, t.primary_color
        HAVING total_dismissals > 0
        ORDER BY total_dismissals DESC, catches DESC
        LIMIT ?
      `;

         const [fielding] = await pool.execute<RowDataPacket[]>(fieldingQuery, [
            ...queryParams,
            limit,
         ]);
         responseData.fielding = fielding || [];
      }

      // Most valuable players (combined performance)
      if (!category || category === "mvp") {
         const mvpQuery = `
        SELECT 
          p.player_id,
          p.player_name,
          p.role,
          p.nationality,
          t.team_name,
          t.team_code,
          t.primary_color,
          COUNT(DISTINCT m.match_id) as matches_played,
          COALESCE(SUM(bs.runs_scored), 0) as total_runs,
          COALESCE(SUM(bls.wickets_taken), 0) as total_wickets,
          COALESCE(COUNT(CASE WHEN d.fielder_id = p.player_id THEN 1 END), 0) as total_dismissals,
          -- MVP Score calculation (runs + wickets*20 + dismissals*10)
          (COALESCE(SUM(bs.runs_scored), 0) + 
           COALESCE(SUM(bls.wickets_taken), 0) * 20 + 
           COALESCE(COUNT(CASE WHEN d.fielder_id = p.player_id THEN 1 END), 0) * 10) as mvp_score
        FROM matches m
        LEFT JOIN series se ON m.series_id = se.series_id
        JOIN teams t ON (m.team1_id = t.team_id OR m.team2_id = t.team_id)
        JOIN players p ON p.is_active = true
        LEFT JOIN batting_scorecards bs ON m.match_id = bs.match_id AND bs.player_id = p.player_id AND bs.team_id = t.team_id
        LEFT JOIN bowling_scorecards bls ON m.match_id = bls.match_id AND bls.player_id = p.player_id AND bls.team_id = t.team_id
        LEFT JOIN dismissals d ON (bs.scorecard_id = d.scorecard_id OR bls.scorecard_id = d.scorecard_id) AND d.fielder_id = p.player_id
        ${whereClause.replace("bs.team_id", "t.team_id")}
        GROUP BY p.player_id, p.player_name, p.role, p.nationality, t.team_name, t.team_code, t.primary_color
        HAVING matches_played > 0 AND mvp_score > 0
        ORDER BY mvp_score DESC
        LIMIT ?
      `;

         const mvpParams = teamId
            ? [...queryParams.slice(0, -1), parseInt(teamId), limit]
            : [...queryParams, limit];

         const [mvp] = await pool.execute<RowDataPacket[]>(mvpQuery, mvpParams);
         responseData.mvp = mvp || [];
      }

      return NextResponse.json({
         success: true,
         data: responseData,
      });
   } catch (error) {
      console.error("Error fetching player statistics:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch player statistics" },
         { status: 500 }
      );
   }
}
