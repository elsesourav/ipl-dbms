import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const createConnection = async () => {
  return await mysql.createConnection({
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'ipl_database',
  });
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = await createConnection();
    const teamId = params.id;

    // Get current season stats (latest series)
    const [statsRows] = await connection.execute(
      `SELECT 
        ts.matches_played,
        ts.matches_won,
        ts.matches_lost,
        ts.no_results,
        ts.points,
        ts.net_run_rate
      FROM TeamStats ts
      JOIN Series s ON ts.series_id = s.series_id
      WHERE ts.team_id = ?
      ORDER BY s.season_year DESC
      LIMIT 1`,
      [teamId]
    );

    await connection.end();

    if (Array.isArray(statsRows) && statsRows.length === 0) {
      // Return default stats if none found
      return NextResponse.json({
        matches_played: 0,
        matches_won: 0,
        matches_lost: 0,
        no_results: 0,
        points: 0,
        net_run_rate: 0.00
      });
    }

    return NextResponse.json(statsRows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
