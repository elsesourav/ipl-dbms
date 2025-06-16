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
    const playerId = params.id;

    // Get latest season stats
    const [rows] = await connection.execute(
      `SELECT 
        ps.matches_played,
        ps.runs_scored,
        ps.balls_faced,
        ps.fours,
        ps.sixes,
        ps.highest_score,
        ps.fifties,
        ps.hundreds,
        ps.overs_bowled,
        ps.runs_conceded,
        ps.wickets_taken,
        ps.best_bowling,
        ps.catches,
        ps.stumping
      FROM PlayerStats ps
      JOIN Series s ON ps.series_id = s.series_id
      WHERE ps.player_id = ?
      ORDER BY s.season_year DESC
      LIMIT 1`,
      [playerId]
    );

    await connection.end();

    if (Array.isArray(rows) && rows.length === 0) {
      // Return default stats if none found
      return NextResponse.json({
        matches_played: 0,
        runs_scored: 0,
        balls_faced: 0,
        fours: 0,
        sixes: 0,
        highest_score: 0,
        fifties: 0,
        hundreds: 0,
        overs_bowled: 0,
        runs_conceded: 0,
        wickets_taken: 0,
        best_bowling: null,
        catches: 0,
        stumping: 0
      });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
