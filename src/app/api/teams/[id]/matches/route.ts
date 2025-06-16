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
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';

    const [rows] = await connection.execute(
      `SELECT 
        m.match_id,
        m.match_date,
        CASE 
          WHEN m.team1_id = ? THEN t2.team_name
          ELSE t1.team_name
        END as opponent,
        s.stadium_name as venue,
        CASE 
          WHEN m.winner_id = ? THEN 'Won'
          WHEN m.winner_id IS NULL THEN 'No Result'
          ELSE 'Lost'
        END as result,
        m.win_margin,
        m.win_type
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Stadiums s ON m.stadium_id = s.stadium_id
      WHERE (m.team1_id = ? OR m.team2_id = ?) AND m.is_completed = TRUE
      ORDER BY m.match_date DESC
      LIMIT ?`,
      [teamId, teamId, teamId, teamId, parseInt(limit)]
    );

    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
