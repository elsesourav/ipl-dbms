import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ipl_dbms',
  port: parseInt(process.env.DB_PORT || '3306'),
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    // Get stadium details
    const [stadiumRows] = await connection.execute(`
      SELECT * FROM stadiums WHERE id = ?
    `, [params.id]);

    if (!stadiumRows || (stadiumRows as any[]).length === 0) {
      return NextResponse.json({ error: 'Stadium not found' }, { status: 404 });
    }

    const stadium = (stadiumRows as any[])[0];

    // Get matches played at this stadium
    const [matchRows] = await connection.execute(`
      SELECT 
        m.*,
        t1.name as team1_name,
        t1.short_name as team1_short,
        t1.logo_url as team1_logo,
        t2.name as team2_name,
        t2.short_name as team2_short,
        t2.logo_url as team2_logo,
        wt.name as winner_name,
        wt.short_name as winner_short,
        sr.name as series_name,
        sr.year as series_year
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.id
      JOIN teams t2 ON m.team2_id = t2.id
      LEFT JOIN teams wt ON m.winner_id = wt.id
      JOIN series sr ON m.series_id = sr.id
      WHERE m.stadium_id = ?
      ORDER BY m.date DESC
    `, [params.id]);

    // Get stadium statistics
    const [statsRows] = await connection.execute(`
      SELECT 
        COUNT(*) as total_matches,
        COUNT(CASE WHEN winner_id IS NOT NULL THEN 1 END) as completed_matches,
        COUNT(CASE WHEN toss_winner_id = team1_id AND winner_id = team1_id THEN 1 END) +
        COUNT(CASE WHEN toss_winner_id = team2_id AND winner_id = team2_id THEN 1 END) as toss_win_advantage,
        AVG(CASE WHEN result_type = 'runs' THEN CAST(SUBSTRING_INDEX(result_margin, ' ', 1) AS UNSIGNED) END) as avg_runs_margin,
        AVG(CASE WHEN result_type = 'wickets' THEN CAST(SUBSTRING_INDEX(result_margin, ' ', 1) AS UNSIGNED) END) as avg_wickets_margin
      FROM matches 
      WHERE stadium_id = ?
    `, [params.id]);

    // Get team performance at this stadium
    const [teamStatsRows] = await connection.execute(`
      SELECT 
        t.id,
        t.name,
        t.short_name,
        t.logo_url,
        COUNT(*) as matches_played,
        COUNT(CASE WHEN m.winner_id = t.id THEN 1 END) as wins,
        COUNT(CASE WHEN m.winner_id IS NOT NULL AND m.winner_id != t.id THEN 1 END) as losses
      FROM teams t
      JOIN (
        SELECT team1_id as team_id, winner_id, id FROM matches WHERE stadium_id = ?
        UNION ALL
        SELECT team2_id as team_id, winner_id, id FROM matches WHERE stadium_id = ?
      ) m ON t.id = m.team_id
      GROUP BY t.id, t.name, t.short_name, t.logo_url
      HAVING matches_played > 0
      ORDER BY wins DESC, matches_played DESC
    `, [params.id, params.id]);

    await connection.end();

    const stats = (statsRows as any[])[0];

    return NextResponse.json({
      stadium,
      matches: matchRows,
      statistics: {
        total_matches: stats.total_matches,
        completed_matches: stats.completed_matches,
        completion_rate: stats.total_matches > 0 ? (stats.completed_matches / stats.total_matches * 100).toFixed(1) : '0',
        toss_advantage: stats.total_matches > 0 ? (stats.toss_win_advantage / stats.completed_matches * 100).toFixed(1) : '0',
        avg_runs_margin: stats.avg_runs_margin ? Math.round(stats.avg_runs_margin) : null,
        avg_wickets_margin: stats.avg_wickets_margin ? Math.round(stats.avg_wickets_margin) : null
      },
      team_performance: teamStatsRows
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
