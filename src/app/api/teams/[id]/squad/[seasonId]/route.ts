import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/teams/[id]/squad/[seasonId] - Get team squad for a specific season
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string; seasonId: string } }
) {
   try {
      const teamId = parseInt(params.id);
      const seasonId = params.seasonId;
      const { searchParams } = new URL(request.url);
      const role = searchParams.get("role");
      const nationality = searchParams.get("nationality");
      const includeStats = searchParams.get("include_stats") === "true";

      if (isNaN(teamId)) {
         return NextResponse.json(
            { success: false, error: "Invalid team ID" },
            { status: 400 }
         );
      }

      // Check if team exists
      const teamQuery = `
      SELECT team_id, team_name, team_code, city, primary_color, secondary_color
      FROM teams 
      WHERE team_id = ? AND is_active = true
    `;
      const [teamResult] = await pool.execute<RowDataPacket[]>(teamQuery, [
         teamId,
      ]);

      if (!teamResult || teamResult.length === 0) {
         return NextResponse.json(
            { success: false, error: "Team not found" },
            { status: 404 }
         );
      }

      const team = teamResult[0];

      // Check if season exists
      const seasonQuery = `
      SELECT season, series_name, start_date, end_date 
      FROM series 
      WHERE season = ?
    `;
      const [seasonResult] = await pool.execute<RowDataPacket[]>(seasonQuery, [
         seasonId,
      ]);

      if (!seasonResult || seasonResult.length === 0) {
         return NextResponse.json(
            { success: false, error: "Season not found" },
            { status: 404 }
         );
      }

      const season = seasonResult[0];

      // Build squad query based on contracts
      let squadQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        p.nationality,
        p.date_of_birth,
        p.batting_style,
        p.bowling_style,
        p.is_active,
        pc.contract_value,
        pc.category,
        pc.contract_type,
        pc.is_retained,
        pc.status as contract_status,
        -- Calculate age
        TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age,
        -- Get captain/vice-captain info
        CASE WHEN ms.captain_id = p.player_id THEN true ELSE false END as is_captain,
        CASE WHEN ms.vice_captain_id = p.player_id THEN true ELSE false END as is_vice_captain
      FROM player_contracts pc
      JOIN players p ON pc.player_id = p.player_id
      LEFT JOIN (
        SELECT DISTINCT captain_id, vice_captain_id 
        FROM match_squads 
        WHERE team_id = ? AND match_id IN (
          SELECT match_id FROM matches m 
          JOIN series s ON m.series_id = s.series_id 
          WHERE s.season = ?
        )
        ORDER BY match_id DESC
        LIMIT 1
      ) ms ON 1=1
      WHERE pc.team_id = ? AND pc.season = ?
    `;

      let queryParams: any[] = [teamId, seasonId, teamId, seasonId];

      if (role) {
         squadQuery += " AND p.role = ?";
         queryParams.push(role);
      }

      if (nationality) {
         squadQuery += " AND p.nationality = ?";
         queryParams.push(nationality);
      }

      squadQuery += " ORDER BY pc.contract_value DESC, p.player_name";

      const [squad] = await pool.execute<RowDataPacket[]>(
         squadQuery,
         queryParams
      );

      // If stats are requested, get player statistics for the season
      let playerStats: any = {};
      if (includeStats && squad && squad.length > 0) {
         const playerIds = squad.map((player: any) => player.player_id);
         const placeholders = playerIds.map(() => "?").join(",");

         const statsQuery = `
        SELECT 
          ps.player_id,
          ps.matches_played,
          ps.runs_scored,
          ps.balls_faced,
          ps.fours,
          ps.sixes,
          ps.wickets_taken,
          ps.overs_bowled,
          ps.runs_conceded,
          ps.catches,
          ps.run_outs,
          ps.stumpings,
          -- Calculate averages
          CASE WHEN ps.balls_faced > 0 THEN ROUND((ps.runs_scored * 100.0) / ps.balls_faced, 2) ELSE 0 END as strike_rate,
          CASE WHEN ps.overs_bowled > 0 THEN ROUND(ps.runs_conceded / ps.overs_bowled, 2) ELSE 0 END as economy_rate,
          CASE WHEN ps.wickets_taken > 0 THEN ROUND(ps.runs_conceded / ps.wickets_taken, 2) ELSE NULL END as bowling_average
        FROM player_stats ps
        WHERE ps.player_id IN (${placeholders}) AND ps.season = ?
      `;

         const [stats] = await pool.execute<RowDataPacket[]>(statsQuery, [
            ...playerIds,
            seasonId,
         ]);

         if (stats) {
            stats.forEach((stat: any) => {
               playerStats[stat.player_id] = stat;
            });
         }
      }

      // Get squad summary
      const summaryQuery = `
      SELECT 
        COUNT(*) as total_players,
        COUNT(CASE WHEN p.role = 'Batsman' THEN 1 END) as batsmen,
        COUNT(CASE WHEN p.role = 'Bowler' THEN 1 END) as bowlers,
        COUNT(CASE WHEN p.role = 'All-Rounder' THEN 1 END) as all_rounders,
        COUNT(CASE WHEN p.role = 'Wicket-Keeper' THEN 1 END) as wicket_keepers,
        COUNT(CASE WHEN p.nationality = 'India' THEN 1 END) as indian_players,
        COUNT(CASE WHEN p.nationality != 'India' THEN 1 END) as overseas_players,
        COUNT(CASE WHEN pc.is_retained = true THEN 1 END) as retained_players,
        SUM(pc.contract_value) as total_squad_value,
        AVG(pc.contract_value) as average_contract_value,
        MAX(pc.contract_value) as highest_paid_player,
        COUNT(CASE WHEN pc.category = 'Marquee' THEN 1 END) as marquee_players,
        COUNT(CASE WHEN pc.category = 'Icon' THEN 1 END) as icon_players
      FROM player_contracts pc
      JOIN players p ON pc.player_id = p.player_id
      WHERE pc.team_id = ? AND pc.season = ?
    `;

      const [summary] = await pool.execute<RowDataPacket[]>(summaryQuery, [
         teamId,
         seasonId,
      ]);

      // Add stats to squad if requested
      const enrichedSquad = squad
         ? squad.map((player: any) => ({
              ...player,
              season_stats: includeStats
                 ? playerStats[player.player_id] || null
                 : undefined,
           }))
         : [];

      return NextResponse.json({
         success: true,
         data: {
            team,
            season,
            squad: enrichedSquad,
            summary: summary && summary.length > 0 ? summary[0] : {},
            squad_breakdown: {
               by_role: {
                  batsmen: enrichedSquad.filter(
                     (p: any) => p.role === "Batsman"
                  ),
                  bowlers: enrichedSquad.filter(
                     (p: any) => p.role === "Bowler"
                  ),
                  all_rounders: enrichedSquad.filter(
                     (p: any) => p.role === "All-Rounder"
                  ),
                  wicket_keepers: enrichedSquad.filter(
                     (p: any) => p.role === "Wicket-Keeper"
                  ),
               },
               by_nationality: {
                  indian: enrichedSquad.filter(
                     (p: any) => p.nationality === "India"
                  ),
                  overseas: enrichedSquad.filter(
                     (p: any) => p.nationality !== "India"
                  ),
               },
            },
         },
      });
   } catch (error) {
      console.error("Error fetching team squad:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch team squad" },
         { status: 500 }
      );
   }
}
