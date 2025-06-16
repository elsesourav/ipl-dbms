import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      // Get match details with teams, stadium, and series info
      const [matchRows] = await pool.execute(
         `
      SELECT 
        m.*,
        t1.team_name as team1_name,
        t1.team_code as team1_short,
        t1.team_color as team1_logo,
        t2.team_name as team2_name,
        t2.team_code as team2_short,
        t2.team_color as team2_logo,
        s.stadium_name as stadium_name,
        s.city as stadium_city,
        s.capacity as stadium_capacity,
        sr.series_name as series_name,
        sr.season_year as series_year,
        wt.team_name as winner_name,
        wt.team_code as winner_short,
        u1.umpire_name as umpire1_name,
        u2.umpire_name as umpire2_name
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Stadiums s ON m.stadium_id = s.stadium_id
      JOIN Series sr ON m.series_id = sr.series_id
      LEFT JOIN Teams wt ON m.winner_id = wt.team_id
      LEFT JOIN Umpires u1 ON m.umpire1_id = u1.umpire_id
      LEFT JOIN Umpires u2 ON m.umpire2_id = u2.umpire_id
      WHERE m.match_id = ?
    `,
         [params.id]
      );

      if (!matchRows || (matchRows as any[]).length === 0) {
         return NextResponse.json(
            { error: "Match not found" },
            { status: 404 }
         );
      }

      const match = (matchRows as any[])[0];

      // Get batting scorecards
      const [battingRows] = await pool.execute(
         `
      SELECT 
        bs.*,
        p.player_name as player_name,
        p.batting_style,
        t.team_name as team_name,
        t.team_code as team_short
      FROM BattingScorecard bs
      JOIN Players p ON bs.player_id = p.player_id
      JOIN Teams t ON bs.team_id = t.team_id
      WHERE bs.match_id = ?
      ORDER BY bs.team_id, bs.batting_position
    `,
         [params.id]
      );

      // Get bowling scorecards
      const [bowlingRows] = await pool.execute(
         `
      SELECT 
        bw.*,
        p.player_name as player_name,
        p.bowling_style,
        t.team_name as team_name,
        t.team_code as team_short
      FROM BowlingScorecard bw
      JOIN Players p ON bw.player_id = p.player_id
      JOIN Teams t ON bw.team_id = t.team_id
      WHERE bw.match_id = ?
      ORDER BY bw.team_id, bw.overs_bowled DESC
    `,
         [params.id]
      );

      // Group batting and bowling by team
      const team1Batting = (battingRows as any[]).filter(
         (row) => row.team_id === match.team1_id
      );
      const team2Batting = (battingRows as any[]).filter(
         (row) => row.team_id === match.team2_id
      );
      const team1Bowling = (bowlingRows as any[]).filter(
         (row) => row.team_id === match.team2_id
      ); // Team2 bowled to Team1
      const team2Bowling = (bowlingRows as any[]).filter(
         (row) => row.team_id === match.team1_id
      ); // Team1 bowled to Team2

      return NextResponse.json({
         match: {
            id: match.match_id,
            date: match.match_date,
            venue: {
               name: match.stadium_name,
               city: match.stadium_city,
               capacity: match.stadium_capacity,
            },
            series: {
               name: match.series_name,
               year: match.series_year,
            },
            teams: {
               team1: {
                  id: match.team1_id,
                  name: match.team1_name,
                  short_name: match.team1_short,
                  logo_url: match.team1_logo,
               },
               team2: {
                  id: match.team2_id,
                  name: match.team2_name,
                  short_name: match.team2_short,
                  logo_url: match.team2_logo,
               },
            },
            result: {
               winner: match.winner_id
                  ? {
                       id: match.winner_id,
                       name: match.winner_name,
                       short_name: match.winner_short,
                    }
                  : null,
               margin: match.win_margin,
               type: match.win_type,
            },
            officials: {
               umpire1: match.umpire1_name,
               umpire2: match.umpire2_name,
            },
            toss: {
               winner_id: match.toss_winner_id,
               decision: match.toss_decision,
            },
         },
         scorecards: {
            batting: {
               team1: team1Batting,
               team2: team2Batting,
            },
            bowling: {
               team1: team1Bowling,
               team2: team2Bowling,
            },
         },
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
