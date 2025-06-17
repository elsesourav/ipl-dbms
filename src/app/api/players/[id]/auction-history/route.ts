import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../../lib/db";

// GET /api/players/[id]/auction-history - Get player auction history
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const playerId = parseInt(params.id);
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const auctionType = searchParams.get("auction_type");

      if (isNaN(playerId)) {
         return NextResponse.json(
            { success: false, error: "Invalid player ID" },
            { status: 400 }
         );
      }

      // Check if player exists
      const playerQuery = `
      SELECT player_id, player_name, role, nationality, date_of_birth
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

      // Build auction history query
      let auctionQuery = `
      SELECT 
        pah.auction_id,
        pah.season,
        pah.team_id,
        t.team_name,
        t.team_code,
        t.primary_color,
        pah.base_price,
        pah.sold_price,
        pah.auction_type,
        pah.category,
        pah.is_sold,
        pah.is_retained,
        pah.is_right_to_match,
        pah.total_bids,
        pah.highest_bidder_team_id,
        ht.team_name as highest_bidder_team,
        pah.auction_date,
        pah.created_at
      FROM player_auction_history pah
      LEFT JOIN teams t ON pah.team_id = t.team_id
      LEFT JOIN teams ht ON pah.highest_bidder_team_id = ht.team_id
      WHERE pah.player_id = ?
    `;

      let queryParams: any[] = [playerId];

      if (season) {
         auctionQuery += " AND pah.season = ?";
         queryParams.push(season);
      }

      if (auctionType) {
         auctionQuery += " AND pah.auction_type = ?";
         queryParams.push(auctionType);
      }

      auctionQuery += " ORDER BY pah.season DESC, pah.auction_date DESC";

      const [auctionHistory] = await pool.execute(auctionQuery, queryParams);

      // Get auction summary statistics
      const summaryQuery = `
      SELECT 
        COUNT(*) as total_auctions,
        COUNT(CASE WHEN is_sold = true THEN 1 END) as times_sold,
        COUNT(CASE WHEN is_sold = false THEN 1 END) as times_unsold,
        COUNT(CASE WHEN is_retained = true THEN 1 END) as times_retained,
        COUNT(CASE WHEN is_right_to_match = true THEN 1 END) as rtm_used,
        SUM(sold_price) as total_auction_value,
        AVG(CASE WHEN sold_price > 0 THEN sold_price END) as average_sold_price,
        MAX(sold_price) as highest_sold_price,
        MIN(CASE WHEN sold_price > 0 THEN sold_price END) as lowest_sold_price,
        COUNT(DISTINCT team_id) as teams_played_for,
        SUM(total_bids) as total_bids_received
      FROM player_auction_history
      WHERE player_id = ?
    `;

      const [summary] = await pool.execute(summaryQuery, [playerId]);

      // Get team-wise auction summary
      const teamSummaryQuery = `
      SELECT 
        t.team_id,
        t.team_name,
        t.team_code,
        COUNT(*) as times_bought,
        SUM(pah.sold_price) as total_spent,
        AVG(pah.sold_price) as average_price,
        MAX(pah.sold_price) as highest_price,
        GROUP_CONCAT(DISTINCT pah.season ORDER BY pah.season) as seasons
      FROM player_auction_history pah
      JOIN teams t ON pah.team_id = t.team_id
      WHERE pah.player_id = ? AND pah.is_sold = true
      GROUP BY t.team_id, t.team_name, t.team_code
      ORDER BY times_bought DESC, total_spent DESC
    `;

      const [teamSummary] = await pool.execute(teamSummaryQuery, [playerId]);

      return NextResponse.json({
         success: true,
         data: {
            player,
            auction_history: auctionHistory || [],
            summary:
               Array.isArray(summary) && summary.length > 0 ? summary[0] : {},
            team_summary: teamSummary || [],
         },
      });
   } catch (error) {
      console.error("Error fetching player auction history:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch player auction history" },
         { status: 500 }
      );
   }
}
