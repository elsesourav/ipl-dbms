import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ipl_dbms',
  port: parseInt(process.env.DB_PORT || '3306'),
};

export async function GET() {
  try {
    const connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.execute(`
      SELECT 
        s.*,
        COUNT(m.id) as matches_played,
        AVG(CASE WHEN m.winner_id IS NOT NULL THEN 1 ELSE 0 END) as completion_rate
      FROM stadiums s
      LEFT JOIN matches m ON s.id = m.stadium_id
      GROUP BY s.id
      ORDER BY matches_played DESC, s.name
    `);

    await connection.end();

    return NextResponse.json({
      stadiums: rows
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
