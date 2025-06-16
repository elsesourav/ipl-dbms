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

    const [rows] = await connection.execute(
      `SELECT 
        player_id,
        player_name,
        role,
        nationality,
        jersey_number,
        price_crores,
        batting_style,
        bowling_style
      FROM Players 
      WHERE team_id = ? AND is_active = TRUE
      ORDER BY 
        CASE role 
          WHEN 'Wicket-keeper' THEN 1
          WHEN 'Batsman' THEN 2
          WHEN 'All-rounder' THEN 3
          WHEN 'Bowler' THEN 4
          ELSE 5
        END,
        player_name`,
      [teamId]
    );

    await connection.end();

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
