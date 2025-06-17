import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";

// GET /api/mobile - Get mobile app overview (lightweight data)
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const endpoint = searchParams.get("endpoint"); // 'home', 'live', 'schedule', 'standings'

      // Get current season
      const seasonQuery =
         "SELECT MAX(season_year) as current_season, series_id FROM Series GROUP BY series_id ORDER BY current_season DESC LIMIT 1";
      const [seasonResult] = await pool.execute<RowDataPacket[]>(seasonQuery);
      const currentSeason = seasonResult[0].current_season;
      const seriesId = seasonResult[0].series_id;

      let responseData: any = {};

      switch (endpoint) {
         case "home":
            responseData = await getMobileHome(seriesId, currentSeason);
            break;
         case "live":
            responseData = await getMobileLive(seriesId);
            break;
         case "schedule":
            responseData = await getMobileSchedule(seriesId);
            break;
         case "standings":
            responseData = await getMobileStandings(seriesId);
            break;
         default:
            // Return complete mobile overview
            responseData = {
               home: await getMobileHome(seriesId, currentSeason),
               live: await getMobileLive(seriesId),
               schedule: await getMobileSchedule(seriesId, 3), // Limited for overview
               standings: await getMobileStandings(seriesId, 4), // Top 4 teams
            };
      }

      return NextResponse.json({
         success: true,
         season: currentSeason,
         data: responseData,
         timestamp: new Date().toISOString(),
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch mobile data",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

async function getMobileHome(seriesId: number, currentSeason: number) {
   // Latest match result
   const latestMatchQuery = `
    SELECT 
      m.match_id,
      m.match_date,
      t1.team_code as team1,
      t2.team_code as team2,
      w.team_code as winner,
      m.win_margin,
      m.win_type,
      CASE WHEN m.win_type = 'runs' THEN CONCAT(m.win_margin, ' runs')
           WHEN m.win_type = 'wickets' THEN CONCAT(m.win_margin, ' wickets')
           ELSE m.win_type END as result_text
    FROM Matches m
    JOIN Teams t1 ON m.team1_id = t1.team_id
    JOIN Teams t2 ON m.team2_id = t2.team_id
    LEFT JOIN Teams w ON m.winner_id = w.team_id
    WHERE m.series_id = ? AND m.is_completed = TRUE
    ORDER BY m.match_date DESC, m.match_id DESC
    LIMIT 1
  `;

   // Top performers today
   const todayPerformersQuery = `
    SELECT 
      'batting' as type,
      p.player_name,
      t.team_code,
      bs.runs_scored as value,
      CONCAT(bs.runs_scored, ' runs') as display
    FROM BattingScorecard bs
    JOIN Players p ON bs.player_id = p.player_id
    JOIN Teams t ON bs.team_id = t.team_id
    JOIN Matches m ON bs.match_id = m.match_id
    WHERE m.series_id = ? AND DATE(m.match_date) = CURDATE()
    ORDER BY bs.runs_scored DESC
    LIMIT 1
    
    UNION ALL
    
    SELECT 
      'bowling' as type,
      p.player_name,
      t.team_code,
      bow.wickets_taken as value,
      CONCAT(bow.wickets_taken, '/', bow.runs_conceded) as display
    FROM BowlingScorecard bow
    JOIN Players p ON bow.player_id = p.player_id
    JOIN Teams t ON bow.team_id = t.team_id
    JOIN Matches m ON bow.match_id = m.match_id
    WHERE m.series_id = ? AND DATE(m.match_date) = CURDATE()
    ORDER BY bow.wickets_taken DESC
    LIMIT 1
  `;

   const [latestMatch] = await pool.execute<RowDataPacket[]>(latestMatchQuery, [
      seriesId,
   ]);
   const [todayPerformers] = await pool.execute<RowDataPacket[]>(
      todayPerformersQuery,
      [seriesId, seriesId]
   );

   return {
      latest_match: latestMatch[0] || null,
      today_performers: todayPerformers,
      season: currentSeason,
   };
}

async function getMobileLive(seriesId: number) {
   const liveMatchQuery = `
    SELECT 
      m.match_id,
      m.match_number,
      m.match_date,
      m.match_time,
      t1.team_name as team1_name,
      t1.team_code as team1_code,
      t1.team_color as team1_color,
      t2.team_name as team2_name,
      t2.team_code as team2_code,
      t2.team_color as team2_color,
      s.stadium_name,
      s.city,
      m.match_status,
      tw.team_code as toss_winner,
      m.toss_decision
    FROM Matches m
    JOIN Teams t1 ON m.team1_id = t1.team_id
    JOIN Teams t2 ON m.team2_id = t2.team_id
    JOIN Stadiums s ON m.stadium_id = s.stadium_id
    LEFT JOIN Teams tw ON m.toss_winner_id = tw.team_id
    WHERE m.series_id = ? AND m.match_status = 'live'
    LIMIT 1
  `;

   const [liveMatch] = await pool.execute<RowDataPacket[]>(liveMatchQuery, [
      seriesId,
   ]);

   if (liveMatch.length === 0) {
      return { live_match: null };
   }

   // Get live scores for the match
   const liveScoreQuery = `
    SELECT 
      bs.team_id,
      t.team_code,
      SUM(bs.runs_scored) as runs,
      COUNT(CASE WHEN bs.is_out = TRUE THEN 1 END) as wickets,
      SUM(bs.balls_faced) as balls
    FROM BattingScorecard bs
    JOIN Teams t ON bs.team_id = t.team_id
    WHERE bs.match_id = ?
    GROUP BY bs.team_id, t.team_code
  `;

   const [liveScores] = await pool.execute<RowDataPacket[]>(liveScoreQuery, [
      liveMatch[0].match_id,
   ]);

   return {
      live_match: {
         ...liveMatch[0],
         scores: liveScores,
      },
   };
}

async function getMobileSchedule(seriesId: number, limit: number = 10) {
   const scheduleQuery = `
    SELECT 
      m.match_id,
      m.match_number,
      m.match_date,
      m.match_time,
      m.match_type,
      t1.team_code as team1,
      t1.team_color as team1_color,
      t2.team_code as team2,
      t2.team_color as team2_color,
      s.city,
      m.match_status
    FROM Matches m
    JOIN Teams t1 ON m.team1_id = t1.team_id
    JOIN Teams t2 ON m.team2_id = t2.team_id
    JOIN Stadiums s ON m.stadium_id = s.stadium_id
    WHERE m.series_id = ? AND m.match_status IN ('scheduled', 'live')
    ORDER BY m.match_date ASC, m.match_time ASC
    LIMIT ?
  `;

   const [schedule] = await pool.execute<RowDataPacket[]>(scheduleQuery, [
      seriesId,
      limit,
   ]);

   return {
      upcoming_matches: schedule,
   };
}

async function getMobileStandings(seriesId: number, limit: number = 10) {
   const standingsQuery = `
    SELECT 
      t.team_code,
      t.team_color,
      ts.matches_played as mp,
      ts.matches_won as won,
      ts.matches_lost as lost,
      ts.no_results as nr,
      ts.points as pts,
      ROUND(ts.net_run_rate, 3) as nrr
    FROM Teams t
    JOIN TeamStats ts ON t.team_id = ts.team_id
    WHERE ts.series_id = ? AND t.is_active = TRUE
    ORDER BY ts.points DESC, ts.net_run_rate DESC
    LIMIT ?
  `;

   const [standings] = await pool.execute<RowDataPacket[]>(standingsQuery, [
      seriesId,
      limit,
   ]);

   return {
      points_table: standings,
   };
}
