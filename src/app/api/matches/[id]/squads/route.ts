import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../../lib/db";

// GET /api/matches/[id]/squads - Get match squads
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const matchId = parseInt(params.id);

      // Get match basic info
      const matchQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.match_time,
        m.status,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      WHERE m.match_id = ?
    `;

      const [matchInfo] = await pool.execute(matchQuery, [matchId]);

      if ((matchInfo as any[]).length === 0) {
         return NextResponse.json(
            { success: false, error: "Match not found" },
            { status: 404 }
         );
      }

      const match = (matchInfo as any[])[0];

      // Get squad for team 1
      const team1SquadQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        p.batting_style,
        p.bowling_style,
        ms.is_playing_xi,
        ms.is_captain,
        ms.is_vice_captain,
        ms.is_wicket_keeper,
        ms.is_impact_player,
        ms.batting_order,
        ms.bowling_order
      FROM match_squads ms
      JOIN players p ON ms.player_id = p.player_id
      WHERE ms.match_id = ? AND ms.team_id = (
        SELECT team1_id FROM matches WHERE match_id = ?
      )
      ORDER BY ms.is_playing_xi DESC, ms.batting_order ASC, p.player_name
    `;

      const [team1Squad] = await pool.execute(team1SquadQuery, [
         matchId,
         matchId,
      ]);

      // Get squad for team 2
      const team2SquadQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        p.batting_style,
        p.bowling_style,
        ms.is_playing_xi,
        ms.is_captain,
        ms.is_vice_captain,
        ms.is_wicket_keeper,
        ms.is_impact_player,
        ms.batting_order,
        ms.bowling_order
      FROM match_squads ms
      JOIN players p ON ms.player_id = p.player_id
      WHERE ms.match_id = ? AND ms.team_id = (
        SELECT team2_id FROM matches WHERE match_id = ?
      )
      ORDER BY ms.is_playing_xi DESC, ms.batting_order ASC, p.player_name
    `;

      const [team2Squad] = await pool.execute(team2SquadQuery, [
         matchId,
         matchId,
      ]);

      // Get impact player substitutions if any
      const impactPlayersQuery = `
      SELECT 
        ip.substitution_id,
        ip.substituted_at_over,
        ip.substitution_type,
        p_out.player_name as player_out_name,
        p_in.player_name as player_in_name,
        t.team_name
      FROM impact_player_substitutions ip
      JOIN players p_out ON ip.player_out_id = p_out.player_id
      JOIN players p_in ON ip.player_in_id = p_in.player_id
      JOIN teams t ON ip.team_id = t.team_id
      WHERE ip.match_id = ?
      ORDER BY ip.substituted_at_over
    `;

      const [impactPlayers] = await pool.execute(impactPlayersQuery, [matchId]);

      return NextResponse.json({
         success: true,
         data: {
            match: match,
            squads: {
               [match.team1_code]: {
                  team_name: match.team1_name,
                  players: team1Squad,
                  playing_xi: (team1Squad as any[]).filter(
                     (p) => p.is_playing_xi
                  ),
                  substitutes: (team1Squad as any[]).filter(
                     (p) => !p.is_playing_xi
                  ),
               },
               [match.team2_code]: {
                  team_name: match.team2_name,
                  players: team2Squad,
                  playing_xi: (team2Squad as any[]).filter(
                     (p) => p.is_playing_xi
                  ),
                  substitutes: (team2Squad as any[]).filter(
                     (p) => !p.is_playing_xi
                  ),
               },
            },
            impact_player_substitutions: impactPlayers,
         },
      });
   } catch (error) {
      console.error("Match squads error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch match squads" },
         { status: 500 }
      );
   }
}
