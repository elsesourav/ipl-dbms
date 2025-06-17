import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../lib/db";

export async function POST(
   request: NextRequest,
   { params }: { params: { season: string } }
) {
   try {
      const season = parseInt(params.season);
      const body = await request.json();

      if (isNaN(season)) {
         return NextResponse.json({ error: "Invalid season" }, { status: 400 });
      }

      const { player_id, team_id, bid_amount, bid_type = "regular" } = body;

      if (!player_id || !team_id || !bid_amount) {
         return NextResponse.json(
            { error: "Player ID, team ID, and bid amount are required" },
            { status: 400 }
         );
      }

      // Validate bid amount
      if (bid_amount < 20) {
         // Minimum bid in lakhs
         return NextResponse.json(
            { error: "Minimum bid amount is 20 lakhs" },
            { status: 400 }
         );
      }

      // Check if player exists
      const [playerCheck] = await db.execute(
         `SELECT player_id, name FROM players WHERE player_id = ?`,
         [player_id]
      );

      if (!(playerCheck as any[]).length) {
         return NextResponse.json(
            { error: "Player not found" },
            { status: 404 }
         );
      }

      // Check if team exists
      const [teamCheck] = await db.execute(
         `SELECT team_id, name FROM teams WHERE team_id = ?`,
         [team_id]
      );

      if (!(teamCheck as any[]).length) {
         return NextResponse.json({ error: "Team not found" }, { status: 404 });
      }

      // Get current highest bid for this player in this auction
      const [currentBid] = await db.execute(
         `SELECT MAX(bid_amount) as highest_bid
       FROM auction_bids
       WHERE player_id = ? AND auction_year = ?`,
         [player_id, season]
      );

      const highestBid = (currentBid as any[])[0]?.highest_bid || 0;

      // Validate bid increment
      const minimumIncrement =
         highestBid >= 200
            ? 25 // 25 lakhs increment for bids >= 2 crores
            : highestBid >= 100
            ? 20 // 20 lakhs increment for bids >= 1 crore
            : 10; // 10 lakhs increment for lower bids

      if (
         bid_amount <= highestBid ||
         bid_amount < highestBid + minimumIncrement
      ) {
         return NextResponse.json(
            {
               error: `Bid must be at least ${
                  highestBid + minimumIncrement
               } lakhs (minimum increment: ${minimumIncrement} lakhs)`,
               current_highest: highestBid,
               minimum_bid: highestBid + minimumIncrement,
            },
            { status: 400 }
         );
      }

      // Record the bid
      const [result] = await db.execute(
         `INSERT INTO auction_bids 
       (player_id, team_id, auction_year, bid_amount, bid_type, bid_timestamp)
       VALUES (?, ?, ?, ?, ?, NOW())`,
         [player_id, team_id, season, bid_amount, bid_type]
      );

      // Update auction history with the new bid
      await db.execute(
         `INSERT INTO auction_history 
       (player_id, team_id, auction_year, final_price, status)
       VALUES (?, ?, ?, ?, 'bidding')
       ON DUPLICATE KEY UPDATE
       team_id = VALUES(team_id),
       final_price = VALUES(final_price),
       status = VALUES(status)`,
         [player_id, team_id, season, bid_amount]
      );

      return NextResponse.json({
         success: true,
         data: {
            bid_id: (result as any).insertId,
            player: (playerCheck as any[])[0],
            team: (teamCheck as any[])[0],
            bid_amount,
            previous_highest: highestBid,
            message: "Bid recorded successfully",
         },
      });
   } catch (error) {
      console.error("Error recording auction bid:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}

export async function GET(
   request: NextRequest,
   { params }: { params: { season: string } }
) {
   try {
      const season = parseInt(params.season);
      const { searchParams } = new URL(request.url);
      const playerId = searchParams.get("player_id");

      if (isNaN(season)) {
         return NextResponse.json({ error: "Invalid season" }, { status: 400 });
      }

      let query = `
      SELECT 
        ab.*,
        p.name as player_name,
        t.name as team_name,
        t.short_name as team_short
      FROM auction_bids ab
      JOIN players p ON ab.player_id = p.player_id
      JOIN teams t ON ab.team_id = t.team_id
      WHERE ab.auction_year = ?
    `;

      const queryParams: any[] = [season];

      if (playerId) {
         query += ` AND ab.player_id = ?`;
         queryParams.push(parseInt(playerId));
      }

      query += ` ORDER BY ab.bid_timestamp DESC LIMIT 50`;

      const [bids] = await db.execute(query, queryParams);

      return NextResponse.json({
         success: true,
         data: {
            season,
            bids,
         },
      });
   } catch (error) {
      console.error("Error fetching auction bids:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
