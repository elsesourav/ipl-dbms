import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const type = searchParams.get("type") || "batting"; // batting, bowling, all
      const limit = parseInt(searchParams.get("limit") || "10");
      const seriesId = searchParams.get("series_id");

      let seriesFilter = "";
      let seriesJoin = "";

      if (seriesId) {
         seriesFilter = "AND m.series_id = ?";
         seriesJoin = "JOIN Matches m ON bs.match_id = m.match_id";
      }

      if (type === "batting" || type === "all") {
         // Get batting statistics
         const battingQuery = `
            SELECT 
               p.player_id,
               p.player_name,
               t.team_name,
               t.team_code,
               p.role,
               COUNT(DISTINCT bs.match_id) as matches_played,
               SUM(bs.runs_scored) as total_runs,
               SUM(bs.balls_faced) as total_balls,
               SUM(bs.fours) as total_fours,
               SUM(bs.sixes) as total_sixes,
               MAX(bs.runs_scored) as highest_score,
               CASE 
                  WHEN SUM(bs.balls_faced) > 0 THEN ROUND((SUM(bs.runs_scored) * 100.0 / SUM(bs.balls_faced)), 2)
                  ELSE 0 
               END as strike_rate,
               SUM(CASE WHEN bs.runs_scored >= 50 THEN 1 ELSE 0 END) as fifties,
               SUM(CASE WHEN bs.runs_scored >= 100 THEN 1 ELSE 0 END) as hundreds
            FROM Players p
            LEFT JOIN Teams t ON p.team_id = t.team_id
            LEFT JOIN BattingScorecard bs ON p.player_id = bs.player_id
            ${seriesJoin}
            WHERE p.is_active = TRUE AND bs.runs_scored IS NOT NULL ${seriesFilter}
            GROUP BY p.player_id, p.player_name, t.team_name, t.team_code, p.role
            HAVING total_runs > 0
            ORDER BY total_runs DESC
            LIMIT ?
         `;

         const [battingStats] = await pool.execute(
            battingQuery,
            seriesId ? [seriesId, limit] : [limit]
         );

         if (type === "batting") {
            return NextResponse.json({
               success: true,
               data: { batting: battingStats },
            });
         }
      }

      if (type === "bowling" || type === "all") {
         // Get bowling statistics
         const bowlingQuery = `
            SELECT 
               p.player_id,
               p.player_name,
               t.team_name,
               t.team_code,
               p.role,
               COUNT(DISTINCT bow.match_id) as matches_bowled,
               SUM(bow.overs_bowled) as total_overs,
               SUM(bow.runs_conceded) as total_runs_conceded,
               SUM(bow.wickets_taken) as total_wickets,
               SUM(bow.maiden_overs) as maiden_overs,
               CASE 
                  WHEN SUM(bow.overs_bowled) > 0 THEN ROUND((SUM(bow.runs_conceded) / SUM(bow.overs_bowled)), 2)
                  ELSE 0 
               END as economy_rate,
               CASE 
                  WHEN SUM(bow.wickets_taken) > 0 THEN ROUND((SUM(bow.runs_conceded) / SUM(bow.wickets_taken)), 2)
                  ELSE 0 
               END as average
            FROM Players p
            LEFT JOIN Teams t ON p.team_id = t.team_id
            LEFT JOIN BowlingScorecard bow ON p.player_id = bow.player_id
            ${seriesJoin.replace("bs.", "bow.")}
            WHERE p.is_active = TRUE AND bow.wickets_taken IS NOT NULL ${seriesFilter}
            GROUP BY p.player_id, p.player_name, t.team_name, t.team_code, p.role
            HAVING total_wickets > 0
            ORDER BY total_wickets DESC
            LIMIT ?
         `;

         const [bowlingStats] = await pool.execute(
            bowlingQuery,
            seriesId ? [seriesId, limit] : [limit]
         );

         if (type === "bowling") {
            return NextResponse.json({
               success: true,
               data: { bowling: bowlingStats },
            });
         }
      }

      // If type is 'all', return both batting and bowling stats
      const [battingStats] = await pool.execute(
         `SELECT 
            p.player_id,
            p.player_name,
            t.team_name,
            t.team_code,
            p.role,
            COUNT(DISTINCT bs.match_id) as matches_played,
            SUM(bs.runs_scored) as total_runs,
            SUM(bs.balls_faced) as total_balls,
            MAX(bs.runs_scored) as highest_score,
            CASE 
               WHEN SUM(bs.balls_faced) > 0 THEN ROUND((SUM(bs.runs_scored) * 100.0 / SUM(bs.balls_faced)), 2)
               ELSE 0 
            END as strike_rate
         FROM Players p
         LEFT JOIN Teams t ON p.team_id = t.team_id
         LEFT JOIN BattingScorecard bs ON p.player_id = bs.player_id
         WHERE p.is_active = TRUE AND bs.runs_scored IS NOT NULL
         GROUP BY p.player_id, p.player_name, t.team_name, t.team_code, p.role
         HAVING total_runs > 0
         ORDER BY total_runs DESC
         LIMIT ?`,
         [limit]
      );

      const [bowlingStats] = await pool.execute(
         `SELECT 
            p.player_id,
            p.player_name,
            t.team_name,
            t.team_code,
            p.role,
            COUNT(DISTINCT bow.match_id) as matches_bowled,
            SUM(bow.wickets_taken) as total_wickets,
            CASE 
               WHEN SUM(bow.overs_bowled) > 0 THEN ROUND((SUM(bow.runs_conceded) / SUM(bow.overs_bowled)), 2)
               ELSE 0 
            END as economy_rate
         FROM Players p
         LEFT JOIN Teams t ON p.team_id = t.team_id
         LEFT JOIN BowlingScorecard bow ON p.player_id = bow.player_id
         WHERE p.is_active = TRUE AND bow.wickets_taken IS NOT NULL
         GROUP BY p.player_id, p.player_name, t.team_name, t.team_code, p.role
         HAVING total_wickets > 0
         ORDER BY total_wickets DESC
         LIMIT ?`,
         [limit]
      );

      return NextResponse.json({
         success: true,
         data: {
            batting: battingStats,
            bowling: bowlingStats,
         },
      });
   } catch (error) {
      console.error("Error fetching player statistics:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch player statistics" },
         { status: 500 }
      );
   }
}
