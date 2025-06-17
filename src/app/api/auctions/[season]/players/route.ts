import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { season: string } }
) {
   try {
      const season = parseInt(params.season);
      const { searchParams } = new URL(request.url);
      const teamId = searchParams.get("team_id");
      const status = searchParams.get("status"); // 'sold', 'unsold', 'retained'
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = (page - 1) * limit;

      if (isNaN(season)) {
         return NextResponse.json({ error: "Invalid season" }, { status: 400 });
      }

      let query = `
      SELECT 
        ah.*,
        p.name as player_name,
        p.playing_role,
        p.batting_style,
        p.bowling_style,
        p.nationality,
        t.name as team_name,
        t.short_name as team_short
      FROM auction_history ah
      JOIN players p ON ah.player_id = p.player_id
      LEFT JOIN teams t ON ah.team_id = t.team_id
      WHERE ah.auction_year = ?
    `;

      const queryParams: any[] = [season];

      if (teamId) {
         query += ` AND ah.team_id = ?`;
         queryParams.push(parseInt(teamId));
      }

      if (status) {
         query += ` AND ah.status = ?`;
         queryParams.push(status);
      }

      query += ` ORDER BY ah.final_price DESC, p.name ASC LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);

      const [players] = await db.execute(query, queryParams);

      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM auction_history ah WHERE ah.auction_year = ?`;
      let countParams: any[] = [season];

      if (teamId) {
         countQuery += ` AND ah.team_id = ?`;
         countParams.push(parseInt(teamId));
      }

      if (status) {
         countQuery += ` AND ah.status = ?`;
         countParams.push(status);
      }

      const [countResult] = await db.execute(countQuery, countParams);
      const total = (countResult as any[])[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      // Get auction summary
      const [summary] = await db.execute(
         `SELECT 
        COUNT(*) as total_players,
        COUNT(CASE WHEN status = 'sold' THEN 1 END) as sold_players,
        COUNT(CASE WHEN status = 'unsold' THEN 1 END) as unsold_players,
        COUNT(CASE WHEN status = 'retained' THEN 1 END) as retained_players,
        SUM(CASE WHEN status = 'sold' THEN final_price ELSE 0 END) as total_spent,
        MAX(final_price) as highest_sale,
        AVG(CASE WHEN status = 'sold' THEN final_price END) as average_price
      FROM auction_history
      WHERE auction_year = ?`,
         [season]
      );

      return NextResponse.json({
         success: true,
         data: {
            season,
            players,
            summary: (summary as any[])[0],
            pagination: {
               current_page: page,
               total_pages: totalPages,
               total_items: total,
               items_per_page: limit,
            },
         },
      });
   } catch (error) {
      console.error("Error fetching auction players:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
