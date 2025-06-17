import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";

interface PointsTableEntry extends RowDataPacket {
   team_id: number;
   team_name: string;
   team_code: string;
   matches_played: number;
   matches_won: number;
   matches_lost: number;
   no_results: number;
   points: number;
   net_run_rate: number;
   runs_for: number;
   runs_against: number;
   overs_faced: number;
   overs_bowled: number;
   position: number;
}

interface Series extends RowDataPacket {
   series_id: number;
   series_name: string;
   season_year: number;
   is_completed: boolean;
}

// GET /api/points-table - Get points table for current or specified season
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");
      const includeTotalStats = searchParams.get("include_stats") === "true";

      let seriesId: number;
      let seriesInfo: Series;

      if (season) {
         // Get specific season
         const [seriesResult] = await pool.execute<Series[]>(
            "SELECT * FROM Series WHERE season_year = ?",
            [parseInt(season)]
         );

         if (seriesResult.length === 0) {
            return NextResponse.json(
               { success: false, error: "Season not found" },
               { status: 404 }
            );
         }

         seriesInfo = seriesResult[0];
         seriesId = seriesInfo.series_id;
      } else {
         // Get current active season
         const [currentSeries] = await pool.execute<Series[]>(
            "SELECT * FROM Series WHERE is_completed = false ORDER BY season_year DESC LIMIT 1"
         );

         if (currentSeries.length === 0) {
            // If no active season, get the latest completed season
            const [latestSeries] = await pool.execute<Series[]>(
               "SELECT * FROM Series ORDER BY season_year DESC LIMIT 1"
            );

            if (latestSeries.length === 0) {
               return NextResponse.json(
                  { success: false, error: "No seasons found" },
                  { status: 404 }
               );
            }

            seriesInfo = latestSeries[0];
         } else {
            seriesInfo = currentSeries[0];
         }
         seriesId = seriesInfo.series_id;
      }

      // Get points table from TeamStats or calculate dynamically
      let pointsTableQuery = `
      SELECT 
        t.team_id,
        t.team_name,
        t.team_code,
        t.team_color,
        COALESCE(ts.matches_played, 0) as matches_played,
        COALESCE(ts.matches_won, 0) as matches_won,
        COALESCE(ts.matches_lost, 0) as matches_lost,
        COALESCE(ts.no_results, 0) as no_results,
        COALESCE(ts.points, 0) as points,
        COALESCE(ts.net_run_rate, 0.00) as net_run_rate
    `;

      if (includeTotalStats) {
         pointsTableQuery += `,
        COALESCE(stats.runs_for, 0) as runs_for,
        COALESCE(stats.runs_against, 0) as runs_against,
        COALESCE(stats.overs_faced, 0) as overs_faced,
        COALESCE(stats.overs_bowled, 0) as overs_bowled,
        COALESCE(stats.highest_score, 0) as highest_score,
        COALESCE(stats.lowest_score, 999) as lowest_score
      `;
      }

      pointsTableQuery += `
      FROM Teams t
      LEFT JOIN TeamStats ts ON t.team_id = ts.team_id AND ts.series_id = ?
    `;

      if (includeTotalStats) {
         pointsTableQuery += `
        LEFT JOIN (
          SELECT 
            team_id,
            SUM(runs_scored) as runs_for,
            COUNT(DISTINCT match_id) * 20 as overs_faced,
            MAX(team_total) as highest_score,
            MIN(team_total) as lowest_score
          FROM (
            SELECT 
              bs.team_id,
              bs.match_id,
              SUM(bs.runs_scored) as runs_scored,
              SUM(bs.runs_scored) as team_total
            FROM BattingScorecard bs
            JOIN Matches m ON bs.match_id = m.match_id
            WHERE m.series_id = ? AND m.is_completed = true
            GROUP BY bs.team_id, bs.match_id
          ) team_scores
          GROUP BY team_id
        ) stats ON t.team_id = stats.team_id
      `;
      }

      pointsTableQuery += `
      WHERE t.is_active = true
      ORDER BY ts.points DESC, ts.net_run_rate DESC, t.team_name
    `;

      const params = includeTotalStats ? [seriesId, seriesId] : [seriesId];
      const [pointsTable] = await pool.execute<PointsTableEntry[]>(
         pointsTableQuery,
         params
      );

      // Add position/rank to each team
      const rankedTable = pointsTable.map((team, index) => ({
         ...team,
         position: index + 1,
      }));

      // Get additional series statistics
      const [matchStats] = await pool.execute<RowDataPacket[]>(
         `SELECT 
        COUNT(*) as total_matches,
        SUM(CASE WHEN is_completed = true THEN 1 ELSE 0 END) as completed_matches,
        SUM(CASE WHEN match_status = 'live' THEN 1 ELSE 0 END) as live_matches,
        SUM(CASE WHEN match_status = 'scheduled' THEN 1 ELSE 0 END) as upcoming_matches
      FROM Matches 
      WHERE series_id = ?`,
         [seriesId]
      );

      // Check for playoff qualification (top 4 teams)
      const playoffTeams = rankedTable.slice(0, 4);
      const qualifiedTeams = rankedTable.filter(
         (team) => team.points >= (rankedTable[3]?.points || 0)
      );

      return NextResponse.json({
         success: true,
         data: {
            series: seriesInfo,
            pointsTable: rankedTable,
            playoffs: {
               qualifiedTeams: qualifiedTeams.length >= 4 ? playoffTeams : [],
               qualificationPoints: rankedTable[3]?.points || 0,
               isQualificationComplete:
                  seriesInfo.is_completed || qualifiedTeams.length >= 4,
            },
            statistics: {
               totalTeams: rankedTable.length,
               matchesCompleted: matchStats[0].completed_matches,
               totalMatches: matchStats[0].total_matches,
               liveMatches: matchStats[0].live_matches,
               upcomingMatches: matchStats[0].upcoming_matches,
            },
         },
      });
   } catch (error) {
      console.error("Error fetching points table:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch points table" },
         { status: 500 }
      );
   }
}
