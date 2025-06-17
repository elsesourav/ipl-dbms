import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get("user_id");
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const offset = (page - 1) * limit;

      // Get push notifications
      let query = `
      SELECT 
        n.*,
        CASE 
          WHEN n.type = 'match_start' THEN CONCAT('Match Starting: ', t1.short_name, ' vs ', t2.short_name)
          WHEN n.type = 'match_end' THEN CONCAT('Match Ended: ', t1.short_name, ' vs ', t2.short_name)
          WHEN n.type = 'wicket' THEN CONCAT('Wicket! ', p.name, ' is out')
          WHEN n.type = 'milestone' THEN CONCAT(p.name, ' reached ', n.title)
          ELSE n.title
        END as display_title,
        t1.name as team1_name, t1.short_name as team1_short,
        t2.name as team2_name, t2.short_name as team2_short,
        p.name as player_name
      FROM push_notifications n
      LEFT JOIN matches m ON n.match_id = m.match_id
      LEFT JOIN teams t1 ON m.team1_id = t1.team_id
      LEFT JOIN teams t2 ON m.team2_id = t2.team_id
      LEFT JOIN players p ON n.player_id = p.player_id
    `;

      const params: any[] = [];

      if (userId) {
         query += ` WHERE n.user_id = ? OR n.user_id IS NULL`;
         params.push(userId);
      }

      query += ` ORDER BY n.created_at DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const [notifications] = await pool.execute(query, params);

      // Get total count
      let countQuery = `SELECT COUNT(*) as total FROM push_notifications n`;
      const countParams: any[] = [];

      if (userId) {
         countQuery += ` WHERE n.user_id = ? OR n.user_id IS NULL`;
         countParams.push(userId);
      }

      const [countResult] = await pool.execute(countQuery, countParams);
      const total = (countResult as any[])[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      return NextResponse.json({
         success: true,
         data: {
            notifications,
            pagination: {
               current_page: page,
               total_pages: totalPages,
               total_items: total,
               items_per_page: limit,
            },
         },
      });
   } catch (error) {
      console.error("Error fetching notifications:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}

export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { user_id, type, title, message, match_id, player_id } = body;

      if (!type || !title || !message) {
         return NextResponse.json(
            { error: "Type, title and message are required" },
            { status: 400 }
         );
      }

      const [result] = await pool.execute(
         `INSERT INTO push_notifications 
       (user_id, type, title, message, match_id, player_id, created_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
         [
            user_id || null,
            type,
            title,
            message,
            match_id || null,
            player_id || null,
         ]
      );

      return NextResponse.json({
         success: true,
         data: {
            notification_id: (result as any).insertId,
            message: "Notification created successfully",
         },
      });
   } catch (error) {
      console.error("Error creating notification:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
