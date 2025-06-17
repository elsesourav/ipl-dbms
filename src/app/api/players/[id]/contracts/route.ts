import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/players/[id]/contracts - Get player contracts
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const playerId = parseInt(params.id);
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const status = searchParams.get("status");

      if (isNaN(playerId)) {
         return NextResponse.json(
            { success: false, error: "Invalid player ID" },
            { status: 400 }
         );
      }

      // Check if player exists
      const playerQuery = `
      SELECT player_id, player_name, role 
      FROM players 
      WHERE player_id = ? AND is_active = true
    `;
      const [playerResult] = await pool.execute(playerQuery, [playerId]);

      if (!Array.isArray(playerResult) || playerResult.length === 0) {
         return NextResponse.json(
            { success: false, error: "Player not found" },
            { status: 404 }
         );
      }

      const player = playerResult[0];

      // Build contract query
      let contractQuery = `
      SELECT 
        pc.contract_id,
        pc.season,
        pc.team_id,
        t.team_name,
        t.team_code,
        t.primary_color,
        pc.contract_value,
        pc.base_price,
        pc.category,
        pc.contract_type,
        pc.start_date,
        pc.end_date,
        pc.status,
        pc.is_retained,
        pc.release_date,
        pc.created_at
      FROM player_contracts pc
      JOIN teams t ON pc.team_id = t.team_id
      WHERE pc.player_id = ?
    `;

      let queryParams: any[] = [playerId];

      if (season) {
         contractQuery += " AND pc.season = ?";
         queryParams.push(season);
      }

      if (status) {
         contractQuery += " AND pc.status = ?";
         queryParams.push(status);
      }

      contractQuery += " ORDER BY pc.season DESC, pc.created_at DESC";

      const [contracts] = await pool.execute(contractQuery, queryParams);

      // Get contract summary
      const summaryQuery = `
      SELECT 
        COUNT(*) as total_contracts,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_contracts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_contracts,
        COUNT(CASE WHEN status = 'terminated' THEN 1 END) as terminated_contracts,
        COUNT(CASE WHEN is_retained = true THEN 1 END) as retained_count,
        SUM(contract_value) as total_earnings,
        AVG(contract_value) as average_contract_value,
        MAX(contract_value) as highest_contract,
        MIN(CASE WHEN contract_value > 0 THEN contract_value END) as lowest_contract
      FROM player_contracts
      WHERE player_id = ?
    `;

      const [summary] = await pool.execute(summaryQuery, [playerId]);

      return NextResponse.json({
         success: true,
         data: {
            player,
            contracts: contracts || [],
            summary:
               Array.isArray(summary) && summary.length > 0 ? summary[0] : {},
         },
      });
   } catch (error) {
      console.error("Error fetching player contracts:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch player contracts" },
         { status: 500 }
      );
   }
}
