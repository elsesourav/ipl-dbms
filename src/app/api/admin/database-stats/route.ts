import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";

// GET /api/admin/database-stats - Get database statistics
export async function GET(request: NextRequest) {
   try {
      // Get table counts and sizes
      const tableStatsQuery = `
      SELECT 
        table_name,
        table_rows,
        ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
        ROUND((data_length / 1024 / 1024), 2) AS data_size_mb,
        ROUND((index_length / 1024 / 1024), 2) AS index_size_mb
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
      ORDER BY (data_length + index_length) DESC
    `;

      const [tableStats] = await pool.execute(tableStatsQuery);

      // Get detailed record counts
      const recordCountsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM teams) as teams,
        (SELECT COUNT(*) FROM players) as players,
        (SELECT COUNT(*) FROM matches) as matches,
        (SELECT COUNT(*) FROM batting_scorecards) as batting_scorecards,
        (SELECT COUNT(*) FROM bowling_scorecards) as bowling_scorecards,
        (SELECT COUNT(*) FROM series) as series,
        (SELECT COUNT(*) FROM stadiums) as stadiums,
        (SELECT COUNT(*) FROM umpires) as umpires,
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM player_contracts) as player_contracts,
        (SELECT COUNT(*) FROM auction_history) as auction_history
    `;

      const [recordCounts] = await pool.execute(recordCountsQuery);

      // Get data growth over time
      const growthQuery = `
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as daily_matches
      FROM matches 
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 30
    `;

      const [growthData] = await pool.execute(growthQuery);

      // Get performance statistics
      const performanceQuery = `
      SELECT 
        'matches' as entity,
        COUNT(*) as total_records,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed,
        COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming,
        COUNT(CASE WHEN status = 'live' THEN 1 END) as live
      FROM matches
      UNION ALL
      SELECT 
        'players' as entity,
        COUNT(*) as total_records,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive,
        0 as live
      FROM players
      UNION ALL
      SELECT 
        'teams' as entity,
        COUNT(*) as total_records,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN is_active = false THEN 1 END) as inactive,
        0 as live
      FROM teams
    `;

      const [performanceStats] = await pool.execute(performanceQuery);

      // Calculate total database size
      const totalSizeQuery = `
      SELECT 
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS total_size_mb,
        ROUND(SUM(data_length) / 1024 / 1024, 2) AS total_data_mb,
        ROUND(SUM(index_length) / 1024 / 1024, 2) AS total_index_mb
      FROM information_schema.tables 
      WHERE table_schema = DATABASE()
    `;

      const [totalSize] = await pool.execute(totalSizeQuery);

      return NextResponse.json({
         success: true,
         data: {
            summary: {
               total_size: totalSize[0],
               record_counts: recordCounts[0],
               table_count: (tableStats as any[]).length,
            },
            tables: tableStats,
            performance: performanceStats,
            growth: growthData,
            last_updated: new Date().toISOString(),
         },
      });
   } catch (error) {
      console.error("Database stats error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch database statistics" },
         { status: 500 }
      );
   }
}
