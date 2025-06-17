import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const userId = parseInt(params.id);
      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "20");
      const offset = (page - 1) * limit;

      if (isNaN(userId)) {
         return NextResponse.json(
            { error: "Invalid user ID" },
            { status: 400 }
         );
      }

      // Get user activity log
      const [activities] = await pool.execute(
         `SELECT 
        ua.*,
        u.username,
        u.email
       FROM user_activity ua
       JOIN users u ON ua.user_id = u.user_id
       WHERE ua.user_id = ?
       ORDER BY ua.activity_timestamp DESC
       LIMIT ? OFFSET ?`,
         [userId, limit, offset]
      );

      // Get total count
      const [countResult] = await pool.execute(
         `SELECT COUNT(*) as total FROM user_activity WHERE user_id = ?`,
         [userId]
      );

      const total = (countResult as any[])[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      // Get user info
      const [userInfo] = await pool.execute(
         `SELECT user_id, username, email, full_name, role, created_at, last_login
       FROM users WHERE user_id = ?`,
         [userId]
      );

      if (!(userInfo as any[]).length) {
         return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      return NextResponse.json({
         success: true,
         data: {
            user: (userInfo as any[])[0],
            activities,
            pagination: {
               current_page: page,
               total_pages: totalPages,
               total_items: total,
               items_per_page: limit,
            },
         },
      });
   } catch (error) {
      console.error("Error fetching user activity:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
