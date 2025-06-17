import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";

// GET /api/admin/system-health - Get system health check
export async function GET(request: NextRequest) {
   try {
      const healthChecks: any[] = [];

      // Database connection health
      try {
         const [dbResult] = await pool.execute("SELECT 1 as status");
         healthChecks.push({
            component: "database",
            status: "healthy",
            response_time: Date.now(),
            details: "Database connection successful",
         });
      } catch (dbError) {
         healthChecks.push({
            component: "database",
            status: "unhealthy",
            response_time: null,
            details: "Database connection failed",
         });
      }

      // Database size and performance metrics
      const dbStatsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM teams) as total_teams,
        (SELECT COUNT(*) FROM players) as total_players,
        (SELECT COUNT(*) FROM matches) as total_matches,
        (SELECT COUNT(*) FROM batting_scorecards) as total_batting_records,
        (SELECT COUNT(*) FROM bowling_scorecards) as total_bowling_records,
        (SELECT COUNT(*) FROM users) as total_users
    `;

      const [dbStats] = await pool.execute(dbStatsQuery);

      // System performance metrics
      const performanceQuery = `
      SELECT 
        COUNT(*) as active_sessions,
        MAX(created_at) as last_activity
      FROM users 
      WHERE last_login >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
    `;

      const [performance] = await pool.execute(performanceQuery);

      // Check database size
      const storageQuery = `
      SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS total_size_mb
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `;

      const [storage] = await pool.execute(storageQuery);
      const dbSizeMB = (storage as any)[0]?.total_size_mb || 0;

      // Overall system health status
      const overallStatus = healthChecks.every(
         (check) => check.status === "healthy"
      )
         ? "healthy"
         : "warning";

      return NextResponse.json({
         success: true,
         data: {
            overall_status: overallStatus,
            timestamp: new Date().toISOString(),
            health_checks: healthChecks,
            metrics: {
               database: dbStats[0],
               performance: performance[0],
               storage: {
                  database_size_mb: dbSizeMB,
                  estimated_records:
                     (dbStats as any)[0]?.total_batting_records +
                     (dbStats as any)[0]?.total_bowling_records,
               },
            },
            recommendations: [
               ...(dbSizeMB > 1000
                  ? ["Consider database optimization for large size"]
                  : []),
               ...(overallStatus === "warning"
                  ? ["Check individual component health"]
                  : []),
            ],
         },
      });
   } catch (error) {
      console.error("System health check error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to perform health check",
            overall_status: "unhealthy",
            timestamp: new Date().toISOString(),
         },
         { status: 500 }
      );
   }
}
