import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/admin/audit-log - Get system audit log
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const action = searchParams.get("action");
      const userId = searchParams.get("user_id");
      const tableName = searchParams.get("table_name");
      const startDate = searchParams.get("start_date");
      const endDate = searchParams.get("end_date");

      let whereConditions: string[] = [];
      let queryParams: any[] = [];

      if (action) {
         whereConditions.push("al.action = ?");
         queryParams.push(action);
      }

      if (userId) {
         whereConditions.push("al.user_id = ?");
         queryParams.push(parseInt(userId));
      }

      if (tableName) {
         whereConditions.push("al.table_name = ?");
         queryParams.push(tableName);
      }

      if (startDate) {
         whereConditions.push("al.created_at >= ?");
         queryParams.push(startDate);
      }

      if (endDate) {
         whereConditions.push("al.created_at <= ?");
         queryParams.push(endDate);
      }

      const whereClause =
         whereConditions.length > 0
            ? "WHERE " + whereConditions.join(" AND ")
            : "";

      const auditLogQuery = `
      SELECT 
        al.audit_id,
        al.table_name,
        al.record_id,
        al.action,
        al.old_values,
        al.new_values,
        al.user_id,
        al.created_at,
        u.username,
        u.email,
        u.role as user_role
      FROM audit_log al
      LEFT JOIN users u ON al.user_id = u.user_id
      ${whereClause}
      ORDER BY al.created_at DESC
      LIMIT ? OFFSET ?
    `;

      queryParams.push(limit, offset);
      const [auditLogs] = await pool.execute(auditLogQuery, queryParams);

      // Get total count for pagination
      const countQuery = `
      SELECT COUNT(*) as total 
      FROM audit_log al
      ${whereClause}
    `;

      const countParams = queryParams.slice(0, -2); // Remove limit and offset
      const [countResult] = await pool.execute(countQuery, countParams);
      const total = (countResult as any)[0].total;

      // Get summary statistics
      const summaryQuery = `
      SELECT 
        COUNT(*) as total_entries,
        COUNT(DISTINCT table_name) as affected_tables,
        COUNT(DISTINCT user_id) as unique_users,
        SUM(CASE WHEN action = 'INSERT' THEN 1 ELSE 0 END) as inserts,
        SUM(CASE WHEN action = 'UPDATE' THEN 1 ELSE 0 END) as updates,
        SUM(CASE WHEN action = 'DELETE' THEN 1 ELSE 0 END) as deletes,
        MAX(created_at) as last_activity
      FROM audit_log
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `;

      const [summary] = await pool.execute(summaryQuery);

      return NextResponse.json({
         success: true,
         data: {
            audit_logs: auditLogs,
            summary: summary[0],
            pagination: {
               total,
               limit,
               offset,
               hasMore: offset + limit < total,
            },
         },
      });
   } catch (error) {
      console.error("Audit log error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch audit log" },
         { status: 500 }
      );
   }
}
