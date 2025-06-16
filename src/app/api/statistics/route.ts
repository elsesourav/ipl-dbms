import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
   try {
      const connection = pool;

      // Get basic statistics
      const [teamStats] = await connection.execute(
         "SELECT COUNT(*) as total_teams FROM teams"
      );
      const [playerStats] = await connection.execute(
         "SELECT COUNT(*) as total_players FROM players"
      );
      const [matchStats] = await connection.execute(
         "SELECT COUNT(*) as total_matches FROM matches"
      );
      const [seriesStats] = await connection.execute(
         "SELECT COUNT(*) as total_series FROM series"
      );

      // Get top scorers
      const [topScorers] = await connection.execute(`
      SELECT 
        p.name,
        p.team,
        SUM(CASE 
          WHEN sc.batsman_id = p.player_id THEN sc.runs_scored 
          ELSE 0 
        END) as total_runs,
        COUNT(DISTINCT CASE 
          WHEN sc.batsman_id = p.player_id THEN sc.match_id 
          ELSE NULL 
        END) as matches_played
      FROM players p
      LEFT JOIN scorecards sc ON p.player_id = sc.batsman_id
      GROUP BY p.player_id, p.name, p.team
      ORDER BY total_runs DESC
      LIMIT 10
    `);

      // Get top wicket takers
      const [topBowlers] = await connection.execute(`
      SELECT 
        p.name,
        p.team,
        SUM(CASE 
          WHEN sc.bowler_id = p.player_id THEN 1 
          ELSE 0 
        END) as total_wickets,
        COUNT(DISTINCT CASE 
          WHEN sc.bowler_id = p.player_id THEN sc.match_id 
          ELSE NULL 
        END) as matches_bowled
      FROM players p
      LEFT JOIN scorecards sc ON p.player_id = sc.bowler_id
      WHERE sc.wicket_type IS NOT NULL
      GROUP BY p.player_id, p.name, p.team
      ORDER BY total_wickets DESC
      LIMIT 10
    `);

      // Get team performance
      const [teamPerformance] = await connection.execute(`
      SELECT 
        t.name as team_name,
        COUNT(m.match_id) as matches_played,
        SUM(CASE 
          WHEN m.winner = t.name THEN 1 
          ELSE 0 
        END) as matches_won,
        ROUND(
          (SUM(CASE WHEN m.winner = t.name THEN 1 ELSE 0 END) * 100.0) / 
          NULLIF(COUNT(m.match_id), 0), 2
        ) as win_percentage
      FROM teams t
      LEFT JOIN matches m ON (m.team1 = t.name OR m.team2 = t.name)
      GROUP BY t.name
      ORDER BY win_percentage DESC
    `);

      // Get recent matches
      const [recentMatches] = await connection.execute(`
      SELECT 
        m.*,
        s.series_name
      FROM matches m
      LEFT JOIN series s ON m.series_id = s.series_id
      ORDER BY m.date DESC
      LIMIT 10
    `);

      const statistics = {
         overview: {
            total_teams: (teamStats as RowDataPacket[])[0]?.total_teams || 0,
            total_players:
               (playerStats as RowDataPacket[])[0]?.total_players || 0,
            total_matches:
               (matchStats as RowDataPacket[])[0]?.total_matches || 0,
            total_series:
               (seriesStats as RowDataPacket[])[0]?.total_series || 0,
         },
         topScorers: topScorers as RowDataPacket[],
         topBowlers: topBowlers as RowDataPacket[],
         teamPerformance: teamPerformance as RowDataPacket[],
         recentMatches: recentMatches as RowDataPacket[],
      };

      return NextResponse.json({ success: true, data: statistics });
   } catch (error) {
      console.error("Error fetching statistics:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch statistics" },
         { status: 500 }
      );
   }
}
