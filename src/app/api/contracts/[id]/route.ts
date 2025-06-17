import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

interface Contract extends RowDataPacket {
   contract_id: number;
   player_id: number;
   team_id: number;
   season: string;
   contract_value: number;
   base_price: number;
   category: string;
   contract_type: string;
   start_date: string;
   end_date: string;
   status: string;
   is_retained: boolean;
   release_date: string;
}

// GET /api/contracts/[id] - Get contract details
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const contractId = parseInt(params.id);

      if (isNaN(contractId)) {
         return NextResponse.json(
            { success: false, error: "Invalid contract ID" },
            { status: 400 }
         );
      }

      const contractQuery = `
      SELECT 
        pc.contract_id,
        pc.player_id,
        p.player_name,
        p.role,
        p.nationality,
        p.date_of_birth,
        pc.team_id,
        t.team_name,
        t.team_code,
        t.city,
        t.primary_color,
        pc.season,
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
        pc.updated_at
      FROM player_contracts pc
      JOIN players p ON pc.player_id = p.player_id
      JOIN teams t ON pc.team_id = t.team_id
      WHERE pc.contract_id = ?
    `;

      const [contractResult] = await pool.execute<Contract[]>(contractQuery, [
         contractId,
      ]);

      if (!contractResult || contractResult.length === 0) {
         return NextResponse.json(
            { success: false, error: "Contract not found" },
            { status: 404 }
         );
      }

      const contract = contractResult[0];

      // Get player's performance during this contract
      const performanceQuery = `
      SELECT 
        COUNT(DISTINCT m.match_id) as matches_played,
        COALESCE(SUM(bs.runs_scored), 0) as total_runs,
        COALESCE(SUM(bs.balls_faced), 0) as total_balls_faced,
        COALESCE(SUM(bs.fours), 0) as total_fours,
        COALESCE(SUM(bs.sixes), 0) as total_sixes,
        COALESCE(SUM(bls.wickets_taken), 0) as total_wickets,
        COALESCE(SUM(bls.overs_bowled), 0) as total_overs_bowled,
        COALESCE(SUM(bls.runs_conceded), 0) as total_runs_conceded,
        COALESCE(SUM(bls.maiden_overs), 0) as total_maiden_overs,
        -- Calculate averages
        CASE 
          WHEN SUM(bs.balls_faced) > 0 THEN (SUM(bs.runs_scored) * 100.0) / SUM(bs.balls_faced)
          ELSE 0 
        END as strike_rate,
        CASE 
          WHEN SUM(bls.overs_bowled) > 0 THEN SUM(bls.runs_conceded) / SUM(bls.overs_bowled)
          ELSE 0 
        END as economy_rate
      FROM matches m
      LEFT JOIN batting_scorecards bs ON m.match_id = bs.match_id AND bs.player_id = ?
      LEFT JOIN bowling_scorecards bls ON m.match_id = bls.match_id AND bls.player_id = ?
      WHERE m.series_id IN (
        SELECT series_id FROM series WHERE season = ?
      ) AND m.status = 'completed'
      AND (bs.team_id = ? OR bls.team_id = ?)
    `;

      const [performance] = await pool.execute<RowDataPacket[]>(
         performanceQuery,
         [
            contract.player_id,
            contract.player_id,
            contract.season,
            contract.team_id,
            contract.team_id,
         ]
      );

      // Get contract history for this player-team combination
      const historyQuery = `
      SELECT 
        pc.contract_id,
        pc.season,
        pc.contract_value,
        pc.category,
        pc.status,
        pc.is_retained,
        pc.start_date,
        pc.end_date
      FROM player_contracts pc
      WHERE pc.player_id = ? AND pc.team_id = ?
      ORDER BY pc.season DESC
    `;

      const [history] = await pool.execute<RowDataPacket[]>(historyQuery, [
         contract.player_id,
         contract.team_id,
      ]);

      // Get auction details if available
      const auctionQuery = `
      SELECT 
        pah.auction_id,
        pah.base_price as auction_base_price,
        pah.sold_price,
        pah.auction_type,
        pah.is_retained as auction_retained,
        pah.is_right_to_match,
        pah.total_bids,
        pah.auction_date
      FROM player_auction_history pah
      WHERE pah.player_id = ? AND pah.team_id = ? AND pah.season = ?
    `;

      const [auction] = await pool.execute<RowDataPacket[]>(auctionQuery, [
         contract.player_id,
         contract.team_id,
         contract.season,
      ]);

      return NextResponse.json({
         success: true,
         data: {
            contract,
            performance:
               performance && performance.length > 0 ? performance[0] : {},
            contract_history: history || [],
            auction_details: auction && auction.length > 0 ? auction[0] : null,
         },
      });
   } catch (error) {
      console.error("Error fetching contract details:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch contract details" },
         { status: 500 }
      );
   }
}

// PUT /api/contracts/[id] - Update contract (admin only)
export async function PUT(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const contractId = parseInt(params.id);

      if (isNaN(contractId)) {
         return NextResponse.json(
            { success: false, error: "Invalid contract ID" },
            { status: 400 }
         );
      }

      const body = await request.json();
      const {
         contract_value,
         category,
         contract_type,
         start_date,
         end_date,
         status,
         is_retained,
         release_date,
      } = body;

      // Validate required fields
      if (contract_value === undefined || !category || !contract_type) {
         return NextResponse.json(
            { success: false, error: "Required fields missing" },
            { status: 400 }
         );
      }

      const updateQuery = `
      UPDATE player_contracts SET 
        contract_value = ?,
        category = ?,
        contract_type = ?,
        start_date = ?,
        end_date = ?,
        status = ?,
        is_retained = ?,
        release_date = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE contract_id = ?
    `;

      const [result] = await pool.execute<ResultSetHeader>(updateQuery, [
         contract_value,
         category,
         contract_type,
         start_date,
         end_date,
         status || "active",
         is_retained !== undefined ? is_retained : false,
         release_date,
         contractId,
      ]);

      if (result.affectedRows === 0) {
         return NextResponse.json(
            { success: false, error: "Contract not found" },
            { status: 404 }
         );
      }

      return NextResponse.json({
         success: true,
         message: "Contract updated successfully",
      });
   } catch (error) {
      console.error("Error updating contract:", error);
      return NextResponse.json(
         { success: false, error: "Failed to update contract" },
         { status: 500 }
      );
   }
}

// DELETE /api/contracts/[id] - Delete contract (admin only)
export async function DELETE(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const contractId = parseInt(params.id);

      if (isNaN(contractId)) {
         return NextResponse.json(
            { success: false, error: "Invalid contract ID" },
            { status: 400 }
         );
      }

      // Check if contract exists and get details
      const contractQuery = `
      SELECT contract_id, player_id, team_id, season, status
      FROM player_contracts 
      WHERE contract_id = ?
    `;
      const [contractResult] = await pool.execute<RowDataPacket[]>(
         contractQuery,
         [contractId]
      );

      if (!contractResult || contractResult.length === 0) {
         return NextResponse.json(
            { success: false, error: "Contract not found" },
            { status: 404 }
         );
      }

      const contract = contractResult[0];

      // Check if contract is still active
      if (contract.status === "active") {
         return NextResponse.json(
            {
               success: false,
               error: "Cannot delete active contract. Please terminate it first.",
            },
            { status: 400 }
         );
      }

      const deleteQuery = "DELETE FROM player_contracts WHERE contract_id = ?";
      const [result] = await pool.execute<ResultSetHeader>(deleteQuery, [
         contractId,
      ]);

      if (result.affectedRows === 0) {
         return NextResponse.json(
            { success: false, error: "Failed to delete contract" },
            { status: 500 }
         );
      }

      return NextResponse.json({
         success: true,
         message: "Contract deleted successfully",
      });
   } catch (error) {
      console.error("Error deleting contract:", error);
      return NextResponse.json(
         { success: false, error: "Failed to delete contract" },
         { status: 500 }
      );
   }
}
