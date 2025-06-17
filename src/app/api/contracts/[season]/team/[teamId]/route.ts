import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../../../lib/db";

// GET /api/contracts/[season]/team/[teamId] - Get team contracts for season
export async function GET(
   request: NextRequest,
   { params }: { params: { season: string; teamId: string } }
) {
   try {
      const season = params.season;
      const teamId = parseInt(params.teamId);
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status");
      const category = searchParams.get("category");
      const isRetained = searchParams.get("is_retained");

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

      // Build contracts query
      let contractsQuery = `
      SELECT 
        pc.contract_id,
        pc.player_id,
        p.player_name,
        p.role,
        p.nationality,
        p.date_of_birth,
        pc.contract_value,
        pc.base_price,
        pc.category,
        pc.contract_type,
        pc.start_date,
        pc.end_date,
        pc.status,
        pc.is_retained,
        pc.release_date,
        pc.created_at,
        -- Player stats for the season
        COALESCE(ps.matches_played, 0) as matches_played,
        COALESCE(ps.runs_scored, 0) as runs_scored,
        COALESCE(ps.wickets_taken, 0) as wickets_taken,
        COALESCE(ps.catches, 0) as catches,
        COALESCE(ps.run_outs, 0) as run_outs
      FROM player_contracts pc
      JOIN players p ON pc.player_id = p.player_id
      LEFT JOIN player_stats ps ON p.player_id = ps.player_id AND ps.season = pc.season
      WHERE pc.team_id = ? AND pc.season = ?
    `;

      let queryParams: any[] = [teamId, season];

      if (status) {
         contractsQuery += " AND pc.status = ?";
         queryParams.push(status);
      }

      if (category) {
         contractsQuery += " AND pc.category = ?";
         queryParams.push(category);
      }

      if (isRetained !== null) {
         contractsQuery += " AND pc.is_retained = ?";
         queryParams.push(isRetained === "true");
      }

      contractsQuery += " ORDER BY pc.contract_value DESC, p.player_name";

      const [contracts] = await pool.execute<RowDataPacket[]>(
         contractsQuery,
         queryParams
      );

      // Get team contract summary
      const summaryQuery = `
      SELECT 
        COUNT(*) as total_players,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_contracts,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_contracts,
        COUNT(CASE WHEN status = 'terminated' THEN 1 END) as terminated_contracts,
        COUNT(CASE WHEN is_retained = true THEN 1 END) as retained_players,
        SUM(contract_value) as total_spending,
        AVG(contract_value) as average_contract_value,
        MAX(contract_value) as highest_contract,
        MIN(CASE WHEN contract_value > 0 THEN contract_value END) as lowest_contract,
        -- Category breakdown
        COUNT(CASE WHEN category = 'Marquee' THEN 1 END) as marquee_players,
        COUNT(CASE WHEN category = 'Icon' THEN 1 END) as icon_players,
        COUNT(CASE WHEN category = 'Premium' THEN 1 END) as premium_players,
        COUNT(CASE WHEN category = 'Base' THEN 1 END) as base_players,
        -- Role breakdown
        COUNT(CASE WHEN p.role = 'Batsman' THEN 1 END) as batsmen,
        COUNT(CASE WHEN p.role = 'Bowler' THEN 1 END) as bowlers,
        COUNT(CASE WHEN p.role = 'All-Rounder' THEN 1 END) as all_rounders,
        COUNT(CASE WHEN p.role = 'Wicket-Keeper' THEN 1 END) as wicket_keepers
      FROM player_contracts pc
      JOIN players p ON pc.player_id = p.player_id
      WHERE pc.team_id = ? AND pc.season = ?
    `;

      const [summary] = await pool.execute<RowDataPacket[]>(summaryQuery, [
         teamId,
         season,
      ]);

      // Get salary cap information (if available)
      const salaryCaptQuery = `
      SELECT 
        sc.cap_amount,
        sc.used_amount,
        sc.remaining_amount,
        sc.luxury_tax_threshold,
        sc.is_compliant
      FROM salary_cap sc
      WHERE sc.team_id = ? AND sc.season = ?
    `;

      const [salaryCap] = await pool.execute<RowDataPacket[]>(salaryCaptQuery, [
         teamId,
         season,
      ]);

      // Get nationality breakdown
      const nationalityQuery = `
      SELECT 
        p.nationality,
        COUNT(*) as player_count,
        SUM(pc.contract_value) as total_value,
        AVG(pc.contract_value) as average_value
      FROM player_contracts pc
      JOIN players p ON pc.player_id = p.player_id
      WHERE pc.team_id = ? AND pc.season = ?
      GROUP BY p.nationality
      ORDER BY player_count DESC, total_value DESC
    `;

      const [nationalityBreakdown] = await pool.execute<RowDataPacket[]>(
         nationalityQuery,
         [teamId, season]
      );

      return NextResponse.json({
         success: true,
         data: {
            team,
            season,
            contracts: contracts || [],
            summary: summary && summary.length > 0 ? summary[0] : {},
            salary_cap: salaryCap && salaryCap.length > 0 ? salaryCap[0] : null,
            nationality_breakdown: nationalityBreakdown || [],
         },
      });
   } catch (error) {
      console.error("Error fetching team contracts:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch team contracts" },
         { status: 500 }
      );
   }
}
