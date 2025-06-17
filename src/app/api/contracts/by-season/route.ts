import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/contracts/[season] - Get all contracts for season
export async function GET(
   request: NextRequest,
   { params }: { params: { season: string } }
) {
   try {
      const season = params.season;
      const { searchParams } = new URL(request.url);
      const teamId = searchParams.get("team_id");
      const status = searchParams.get("status");
      const category = searchParams.get("category");
      const contractType = searchParams.get("contract_type");
      const limit = parseInt(searchParams.get("limit") || "100");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Build contracts query
      let contractsQuery = `
      SELECT 
        pc.contract_id,
        pc.player_id,
        p.player_name,
        p.role,
        p.nationality,
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
      JOIN players p ON pc.player_id = p.player_id
      JOIN teams t ON pc.team_id = t.team_id
      WHERE pc.season = ?
    `;

      let queryParams: any[] = [season];

      if (teamId) {
         contractsQuery += " AND pc.team_id = ?";
         queryParams.push(parseInt(teamId));
      }

      if (status) {
         contractsQuery += " AND pc.status = ?";
         queryParams.push(status);
      }

      if (category) {
         contractsQuery += " AND pc.category = ?";
         queryParams.push(category);
      }

      if (contractType) {
         contractsQuery += " AND pc.contract_type = ?";
         queryParams.push(contractType);
      }

      contractsQuery += ` 
      ORDER BY pc.contract_value DESC, t.team_name, p.player_name
      LIMIT ? OFFSET ?
    `;
      queryParams.push(limit, offset);

      const [contracts] = await pool.execute<RowDataPacket[]>(
         contractsQuery,
         queryParams
      );

      // Get season summary
      const summaryQuery = `
      SELECT 
        COUNT(*) as total_contracts,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_contracts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_contracts,
        COUNT(CASE WHEN status = 'terminated' THEN 1 END) as terminated_contracts,
        COUNT(CASE WHEN is_retained = true THEN 1 END) as retained_players,
        SUM(contract_value) as total_season_value,
        AVG(contract_value) as average_contract_value,
        MAX(contract_value) as highest_contract,
        MIN(CASE WHEN contract_value > 0 THEN contract_value END) as lowest_contract,
        COUNT(DISTINCT team_id) as teams_with_contracts,
        COUNT(DISTINCT player_id) as unique_players
      FROM player_contracts
      WHERE season = ?
    `;

      const [summary] = await pool.execute<RowDataPacket[]>(summaryQuery, [
         season,
      ]);

      // Get team-wise spending
      const teamSpendingQuery = `
      SELECT 
        t.team_id,
        t.team_name,
        t.team_code,
        COUNT(*) as player_count,
        SUM(pc.contract_value) as total_spending,
        AVG(pc.contract_value) as average_spending,
        MAX(pc.contract_value) as highest_contract,
        COUNT(CASE WHEN pc.category = 'Marquee' THEN 1 END) as marquee_players,
        COUNT(CASE WHEN pc.category = 'Icon' THEN 1 END) as icon_players,
        COUNT(CASE WHEN pc.is_retained = true THEN 1 END) as retained_players
      FROM player_contracts pc
      JOIN teams t ON pc.team_id = t.team_id
      WHERE pc.season = ?
      GROUP BY t.team_id, t.team_name, t.team_code
      ORDER BY total_spending DESC
    `;

      const [teamSpending] = await pool.execute<RowDataPacket[]>(
         teamSpendingQuery,
         [season]
      );

      // Get total count for pagination
      let countQuery = `
      SELECT COUNT(*) as total
      FROM player_contracts pc
      WHERE pc.season = ?
    `;
      let countParams: any[] = [season];

      if (teamId) {
         countQuery += " AND pc.team_id = ?";
         countParams.push(parseInt(teamId));
      }
      if (status) {
         countQuery += " AND pc.status = ?";
         countParams.push(status);
      }
      if (category) {
         countQuery += " AND pc.category = ?";
         countParams.push(category);
      }
      if (contractType) {
         countQuery += " AND pc.contract_type = ?";
         countParams.push(contractType);
      }

      const [countResult] = await pool.execute<RowDataPacket[]>(
         countQuery,
         countParams
      );
      const totalCount =
         countResult && countResult.length > 0
            ? (countResult[0] as any).total
            : 0;

      return NextResponse.json({
         success: true,
         data: {
            season,
            contracts: contracts || [],
            summary: summary && summary.length > 0 ? summary[0] : {},
            team_spending: teamSpending || [],
            pagination: {
               total: totalCount,
               limit,
               offset,
               hasMore: totalCount > offset + limit,
            },
         },
      });
   } catch (error) {
      console.error("Error fetching season contracts:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch season contracts" },
         { status: 500 }
      );
   }
}
