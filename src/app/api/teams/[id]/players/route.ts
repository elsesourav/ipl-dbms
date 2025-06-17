import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/teams/[id]/players - Get all players for a team
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const teamId = parseInt(params.id);
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");

      // Check if team exists
      const teamQuery = `
      SELECT team_id, team_name, team_code
      FROM Teams 
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

      // Get team players through PlayerContracts
      const playersQuery = `
      SELECT 
        p.player_id,
        p.player_name,
        p.role,
        p.batting_style,
        p.bowling_style,
        p.date_of_birth,
        p.nationality,
        p.is_active,
        pc.jersey_number,
        pc.price_crores,
        pc.is_captain,
        pc.is_vice_captain,
        TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) as age
      FROM Players p
      JOIN PlayerContracts pc ON p.player_id = pc.player_id
      WHERE pc.team_id = ?
        AND p.is_active = true
      ORDER BY 
        CASE 
          WHEN pc.is_captain = 1 THEN 1 
          WHEN pc.is_vice_captain = 1 THEN 2
          WHEN p.role = 'Wicket-keeper' THEN 3 
          WHEN p.role = 'Batsman' THEN 4 
          WHEN p.role = 'All-rounder' THEN 5 
          WHEN p.role = 'Bowler' THEN 6 
          ELSE 7 
        END,
        p.player_name
    `;

      const [players] = await pool.execute(playersQuery, [teamId]);

      // Group players by role
      const playersByRole = (players as any[]).reduce((acc, player) => {
         const role = player.role || "Others";
         if (!acc[role]) acc[role] = [];
         acc[role].push(player);
         return acc;
      }, {});

      return NextResponse.json({
         success: true,
         data: {
            team,
            players,
            players_by_role: playersByRole,
            total_players: (players as any[]).length,
         },
      });
   } catch (error) {
      console.error("Team players error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch team players" },
         { status: 500 }
      );
   }
}
