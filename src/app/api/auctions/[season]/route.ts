import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/auctions/[season] - Get auction results for season
export async function GET(
   request: NextRequest,
   { params }: { params: { season: string } }
) {
   try {
      const season = params.season;
      const { searchParams } = new URL(request.url);
      const teamId = searchParams.get("team_id");
      const auctionType = searchParams.get("auction_type");
      const category = searchParams.get("category");
      const sold = searchParams.get("sold"); // 'true', 'false', or null for all
      const limit = parseInt(searchParams.get("limit") || "100");
      const offset = parseInt(searchParams.get("offset") || "0");

      // Verify season exists
      const seasonQuery = `
      SELECT season, series_name, start_date, end_date
      FROM series 
      WHERE season = ?
    `;
      const [seasonInfo] = await pool.execute<RowDataPacket[]>(seasonQuery, [
         season,
      ]);

      if (!seasonInfo || seasonInfo.length === 0) {
         return NextResponse.json(
            { success: false, error: "Season not found" },
            { status: 404 }
         );
      }

      // Build auction results query
      let auctionQuery = `
      SELECT 
        pah.auction_id,
        pah.player_id,
        p.player_name,
        p.role,
        p.nationality,
        p.date_of_birth,
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
        ht.team_code as highest_bidder_code,
        pah.auction_date,
        -- Calculate age at auction
        TIMESTAMPDIFF(YEAR, p.date_of_birth, pah.auction_date) as age_at_auction,
        -- Price difference
        CASE WHEN pah.is_sold THEN (pah.sold_price - pah.base_price) ELSE NULL END as price_increase
      FROM player_auction_history pah
      JOIN players p ON pah.player_id = p.player_id
      LEFT JOIN teams t ON pah.team_id = t.team_id
      LEFT JOIN teams ht ON pah.highest_bidder_team_id = ht.team_id
      WHERE pah.season = ?
    `;

      let queryParams: any[] = [season];

      if (teamId) {
         auctionQuery += " AND pah.team_id = ?";
         queryParams.push(parseInt(teamId));
      }

      if (auctionType) {
         auctionQuery += " AND pah.auction_type = ?";
         queryParams.push(auctionType);
      }

      if (category) {
         auctionQuery += " AND pah.category = ?";
         queryParams.push(category);
      }

      if (sold !== null) {
         auctionQuery += " AND pah.is_sold = ?";
         queryParams.push(sold === "true");
      }

      auctionQuery += ` 
      ORDER BY pah.sold_price DESC, pah.base_price DESC, p.player_name
      LIMIT ? OFFSET ?
    `;
      queryParams.push(limit, offset);

      const [auctionResults] = await pool.execute<RowDataPacket[]>(
         auctionQuery,
         queryParams
      );

      // Get auction summary statistics
      const summaryQuery = `
      SELECT 
        COUNT(*) as total_players,
        COUNT(CASE WHEN is_sold = true THEN 1 END) as players_sold,
        COUNT(CASE WHEN is_sold = false THEN 1 END) as players_unsold,
        COUNT(CASE WHEN is_retained = true THEN 1 END) as players_retained,
        COUNT(CASE WHEN is_right_to_match = true THEN 1 END) as rtm_used,
        SUM(CASE WHEN is_sold = true THEN sold_price ELSE 0 END) as total_spent,
        AVG(CASE WHEN is_sold = true THEN sold_price END) as avg_sold_price,
        MAX(sold_price) as highest_sale,
        MIN(CASE WHEN sold_price > 0 THEN sold_price END) as lowest_sale,
        COUNT(DISTINCT team_id) as teams_participated,
        SUM(total_bids) as total_bids_made,
        COUNT(CASE WHEN auction_type = 'regular' THEN 1 END) as regular_auction_players,
        COUNT(CASE WHEN auction_type = 'accelerated' THEN 1 END) as accelerated_auction_players
      FROM player_auction_history
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
        t.primary_color,
        COUNT(CASE WHEN pah.is_sold = true THEN 1 END) as players_bought,
        SUM(CASE WHEN pah.is_sold = true THEN pah.sold_price ELSE 0 END) as total_spent,
        AVG(CASE WHEN pah.is_sold = true THEN pah.sold_price END) as avg_price_paid,
        MAX(pah.sold_price) as highest_purchase,
        COUNT(CASE WHEN pah.is_retained = true THEN 1 END) as players_retained,
        COUNT(CASE WHEN pah.is_right_to_match = true THEN 1 END) as rtm_used,
        -- Category breakdown
        COUNT(CASE WHEN pah.category = 'Marquee' AND pah.is_sold = true THEN 1 END) as marquee_players,
        COUNT(CASE WHEN pah.category = 'Icon' AND pah.is_sold = true THEN 1 END) as icon_players,
        COUNT(CASE WHEN pah.category = 'Premium' AND pah.is_sold = true THEN 1 END) as premium_players,
        COUNT(CASE WHEN pah.category = 'Base' AND pah.is_sold = true THEN 1 END) as base_players
      FROM teams t
      LEFT JOIN player_auction_history pah ON t.team_id = pah.team_id AND pah.season = ?
      WHERE t.is_active = true
      GROUP BY t.team_id, t.team_name, t.team_code, t.primary_color
      ORDER BY total_spent DESC
    `;

      const [teamSpending] = await pool.execute<RowDataPacket[]>(
         teamSpendingQuery,
         [season]
      );

      // Get category-wise breakdown
      const categoryQuery = `
      SELECT 
        category,
        COUNT(*) as total_players,
        COUNT(CASE WHEN is_sold = true THEN 1 END) as sold,
        COUNT(CASE WHEN is_sold = false THEN 1 END) as unsold,
        SUM(CASE WHEN is_sold = true THEN sold_price ELSE 0 END) as total_value,
        AVG(CASE WHEN is_sold = true THEN sold_price END) as avg_price,
        MAX(sold_price) as highest_sale,
        ROUND(COUNT(CASE WHEN is_sold = true THEN 1 END) * 100.0 / COUNT(*), 2) as sold_percentage
      FROM player_auction_history
      WHERE season = ?
      GROUP BY category
      ORDER BY total_value DESC
    `;

      const [categoryBreakdown] = await pool.execute<RowDataPacket[]>(
         categoryQuery,
         [season]
      );

      // Get total count for pagination
      let countQuery =
         "SELECT COUNT(*) as total FROM player_auction_history WHERE season = ?";
      let countParams: any[] = [season];

      if (teamId) {
         countQuery += " AND team_id = ?";
         countParams.push(parseInt(teamId));
      }
      if (auctionType) {
         countQuery += " AND auction_type = ?";
         countParams.push(auctionType);
      }
      if (category) {
         countQuery += " AND category = ?";
         countParams.push(category);
      }
      if (sold !== null) {
         countQuery += " AND is_sold = ?";
         countParams.push(sold === "true");
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
            season_info: seasonInfo[0],
            auction_results: auctionResults || [],
            summary: summary && summary.length > 0 ? summary[0] : {},
            team_spending: teamSpending || [],
            category_breakdown: categoryBreakdown || [],
            pagination: {
               total: totalCount,
               limit,
               offset,
               hasMore: totalCount > offset + limit,
            },
         },
      });
   } catch (error) {
      console.error("Error fetching auction results:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch auction results" },
         { status: 500 }
      );
   }
}
