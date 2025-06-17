import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/admin - Get admin overview and system statistics
export async function GET(request: NextRequest) {
   try {
      // Get system overview
      const systemStatsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM Teams WHERE is_active = TRUE) as total_teams,
        (SELECT COUNT(*) FROM Players WHERE is_active = TRUE) as total_players,
        (SELECT COUNT(*) FROM Series) as total_seasons,
        (SELECT COUNT(*) FROM Matches) as total_matches,
        (SELECT COUNT(*) FROM Users WHERE is_active = TRUE) as total_users,
        (SELECT COUNT(*) FROM Stadiums) as total_stadiums,
        (SELECT COUNT(*) FROM Umpires) as total_umpires
    `;

      // Get current season statistics
      const currentSeasonQuery = `
      SELECT 
        s.series_id,
        s.series_name,
        s.season_year,
        s.is_completed,
        COUNT(DISTINCT m.match_id) as matches_scheduled,
        COUNT(DISTINCT CASE WHEN m.is_completed = TRUE THEN m.match_id END) as matches_completed,
        COUNT(DISTINCT CASE WHEN m.match_status = 'live' THEN m.match_id END) as matches_live,
        COUNT(DISTINCT pc.player_id) as players_contracted,
        COUNT(DISTINCT pc.team_id) as teams_participating
      FROM Series s
      LEFT JOIN Matches m ON s.series_id = m.series_id
      LEFT JOIN PlayerContracts pc ON s.series_id = pc.series_id
      WHERE s.season_year = (SELECT MAX(season_year) FROM Series)
      GROUP BY s.series_id, s.series_name, s.season_year, s.is_completed
    `;

      // Get recent activity
      const recentActivityQuery = `
      SELECT 
        'match' as activity_type,
        CONCAT('Match ', m.match_number, ': ', t1.team_code, ' vs ', t2.team_code) as description,
        m.match_date as activity_date,
        m.created_at
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      WHERE m.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      UNION ALL
      
      SELECT 
        'player' as activity_type,
        CONCAT('New player: ', player_name) as description,
        NULL as activity_date,
        created_at
      FROM Players
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      UNION ALL
      
      SELECT 
        'contract' as activity_type,
        CONCAT('Contract: ', p.player_name, ' to ', t.team_code) as description,
        NULL as activity_date,
        pc.created_at
      FROM PlayerContracts pc
      JOIN Players p ON pc.player_id = p.player_id
      JOIN Teams t ON pc.team_id = t.team_id
      WHERE pc.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
      
      ORDER BY created_at DESC
      LIMIT 10
    `;

      // Get data integrity checks
      const integrityChecksQuery = `
      SELECT 
        'Players without contracts' as check_name,
        COUNT(*) as issue_count
      FROM Players p
      LEFT JOIN PlayerContracts pc ON p.player_id = pc.player_id
      WHERE p.is_active = TRUE AND pc.contract_id IS NULL
      
      UNION ALL
      
      SELECT 
        'Matches without scorecards' as check_name,
        COUNT(*) as issue_count
      FROM Matches m
      LEFT JOIN BattingScorecard bs ON m.match_id = bs.match_id
      WHERE m.is_completed = TRUE AND bs.scorecard_id IS NULL
      
      UNION ALL
      
      SELECT 
        'Teams without players' as check_name,
        COUNT(*) as issue_count
      FROM Teams t
      LEFT JOIN PlayerContracts pc ON t.team_id = pc.team_id
      WHERE t.is_active = TRUE AND pc.contract_id IS NULL
    `;

      // Get performance metrics
      const performanceQuery = `
      SELECT 
        'Database size' as metric_name,
        ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) as metric_value,
        'MB' as unit
      FROM information_schema.TABLES 
      WHERE table_schema = DATABASE()
      
      UNION ALL
      
      SELECT 
        'Total records' as metric_name,
        (SELECT SUM(table_rows) FROM information_schema.TABLES WHERE table_schema = DATABASE()) as metric_value,
        'records' as unit
    `;

      // Execute all queries
      const [systemStats] = await pool.execute<RowDataPacket[]>(
         systemStatsQuery
      );
      const [currentSeason] = await pool.execute<RowDataPacket[]>(
         currentSeasonQuery
      );
      const [recentActivity] = await pool.execute<RowDataPacket[]>(
         recentActivityQuery
      );
      const [integrityChecks] = await pool.execute<RowDataPacket[]>(
         integrityChecksQuery
      );
      const [performance] = await pool.execute<RowDataPacket[]>(
         performanceQuery
      );

      return NextResponse.json({
         success: true,
         data: {
            system_overview: systemStats[0],
            current_season: currentSeason[0] || null,
            recent_activity: recentActivity,
            integrity_checks: integrityChecks,
            performance_metrics: performance,
            last_updated: new Date().toISOString(),
         },
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch admin data",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// POST /api/admin - Execute admin actions
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { action, data } = body;

      switch (action) {
         case "reset_season":
            return await resetSeason(data.season_year);

         case "backup_database":
            return await backupDatabase();

         case "update_stats":
            return await updateAllStats(data.season_year);

         case "fix_integrity":
            return await fixDataIntegrity();

         default:
            return NextResponse.json(
               { success: false, error: "Unknown admin action" },
               { status: 400 }
            );
      }
   } catch (error) {
      console.error("Admin action error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Admin action failed",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

async function resetSeason(seasonYear: number) {
   // This would reset all data for a specific season
   // Implementation would depend on business requirements
   return NextResponse.json({
      success: true,
      message: `Season ${seasonYear} reset initiated`,
      note: "This is a placeholder - actual implementation would require careful data handling",
   });
}

async function backupDatabase() {
   // This would create a database backup
   // Implementation would use mysqldump or similar
   return NextResponse.json({
      success: true,
      message: "Database backup initiated",
      note: "This is a placeholder - actual implementation would require server-side backup tools",
   });
}

async function updateAllStats(seasonYear: number) {
   try {
      // Update team stats
      const updateTeamStatsQuery = `
      INSERT INTO TeamStats (team_id, series_id, matches_played, matches_won, matches_lost, no_results, points, net_run_rate)
      SELECT 
        t.team_id,
        s.series_id,
        COUNT(CASE WHEN (m.team1_id = t.team_id OR m.team2_id = t.team_id) AND m.is_completed = TRUE THEN 1 END) as matches_played,
        COUNT(CASE WHEN m.winner_id = t.team_id THEN 1 END) as matches_won,
        COUNT(CASE WHEN (m.team1_id = t.team_id OR m.team2_id = t.team_id) AND m.winner_id != t.team_id AND m.winner_id IS NOT NULL THEN 1 END) as matches_lost,
        COUNT(CASE WHEN (m.team1_id = t.team_id OR m.team2_id = t.team_id) AND m.win_type = 'no_result' THEN 1 END) as no_results,
        COUNT(CASE WHEN m.winner_id = t.team_id THEN 1 END) * 2 + COUNT(CASE WHEN (m.team1_id = t.team_id OR m.team2_id = t.team_id) AND m.win_type = 'no_result' THEN 1 END) as points,
        0.00 as net_run_rate
      FROM Teams t
      CROSS JOIN Series s
      LEFT JOIN Matches m ON s.series_id = m.series_id AND (m.team1_id = t.team_id OR m.team2_id = t.team_id)
      WHERE s.season_year = ? AND t.is_active = TRUE
      GROUP BY t.team_id, s.series_id
      ON DUPLICATE KEY UPDATE
        matches_played = VALUES(matches_played),
        matches_won = VALUES(matches_won),
        matches_lost = VALUES(matches_lost),
        no_results = VALUES(no_results),
        points = VALUES(points)
    `;

      await pool.execute(updateTeamStatsQuery, [seasonYear]);

      return NextResponse.json({
         success: true,
         message: `Statistics updated for season ${seasonYear}`,
      });
   } catch (error) {
      throw error;
   }
}

async function fixDataIntegrity() {
   // This would fix common data integrity issues
   return NextResponse.json({
      success: true,
      message: "Data integrity check completed",
      note: "This is a placeholder - actual implementation would fix specific integrity issues",
   });
}
