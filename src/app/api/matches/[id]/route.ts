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
    
    // Get match details with teams, stadium, and series info
    const [matchRows] = await connection.execute(`
      SELECT 
        m.*,
        t1.name as team1_name,
        t1.short_name as team1_short,
        t1.logo_url as team1_logo,
        t2.name as team2_name,
        t2.short_name as team2_short,
        t2.logo_url as team2_logo,
        s.name as stadium_name,
        s.city as stadium_city,
        s.capacity as stadium_capacity,
        sr.name as series_name,
        sr.year as series_year,
        wt.name as winner_name,
        wt.short_name as winner_short,
        u1.name as umpire1_name,
        u2.name as umpire2_name
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.id
      JOIN teams t2 ON m.team2_id = t2.id
      JOIN stadiums s ON m.stadium_id = s.id
      JOIN series sr ON m.series_id = sr.id
      LEFT JOIN teams wt ON m.winner_id = wt.id
      LEFT JOIN umpires u1 ON m.umpire1_id = u1.id
      LEFT JOIN umpires u2 ON m.umpire2_id = u2.id
      WHERE m.id = ?
    `, [params.id]);

    if (!matchRows || (matchRows as any[]).length === 0) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    const match = (matchRows as any[])[0];

    // Get batting scorecards
    const [battingRows] = await connection.execute(`
      SELECT 
        bs.*,
        p.name as player_name,
        p.batting_style,
        t.name as team_name,
        t.short_name as team_short
      FROM batting_scorecards bs
      JOIN players p ON bs.player_id = p.id
      JOIN teams t ON bs.team_id = t.id
      WHERE bs.match_id = ?
      ORDER BY bs.team_id, bs.batting_order
    `, [params.id]);

    // Get bowling scorecards
    const [bowlingRows] = await connection.execute(`
      SELECT 
        bw.*,
        p.name as player_name,
        p.bowling_style,
        t.name as team_name,
        t.short_name as team_short
      FROM bowling_scorecards bw
      JOIN players p ON bw.player_id = p.id
      JOIN teams t ON bw.team_id = t.id
      WHERE bw.match_id = ?
      ORDER BY bw.team_id, bw.overs_bowled DESC
    `, [params.id]);

    await connection.end();

    // Group batting and bowling by team
    const team1Batting = (battingRows as any[]).filter(row => row.team_id === match.team1_id);
    const team2Batting = (battingRows as any[]).filter(row => row.team_id === match.team2_id);
    const team1Bowling = (bowlingRows as any[]).filter(row => row.team_id === match.team2_id); // Team2 bowled to Team1
    const team2Bowling = (bowlingRows as any[]).filter(row => row.team_id === match.team1_id); // Team1 bowled to Team2

    return NextResponse.json({
      match: {
        id: match.id,
        date: match.date,
        venue: {
          name: match.stadium_name,
          city: match.stadium_city,
          capacity: match.stadium_capacity
        },
        series: {
          name: match.series_name,
          year: match.series_year
        },
        teams: {
          team1: {
            id: match.team1_id,
            name: match.team1_name,
            short_name: match.team1_short,
            logo_url: match.team1_logo
          },
          team2: {
            id: match.team2_id,
            name: match.team2_name,
            short_name: match.team2_short,
            logo_url: match.team2_logo
          }
        },
        result: {
          winner: match.winner_id ? {
            id: match.winner_id,
            name: match.winner_name,
            short_name: match.winner_short
          } : null,
          margin: match.result_margin,
          type: match.result_type
        },
        officials: {
          umpire1: match.umpire1_name,
          umpire2: match.umpire2_name
        },
        toss: {
          winner_id: match.toss_winner_id,
          decision: match.toss_decision
        }
      },
      scorecards: {
        batting: {
          team1: team1Batting,
          team2: team2Batting
        },
        bowling: {
          team1: team1Bowling,
          team2: team2Bowling
        }
      }
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
