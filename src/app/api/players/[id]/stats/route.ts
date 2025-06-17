import pool from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const playerId = parseInt(params.id);

      if (isNaN(playerId)) {
         return NextResponse.json(
            { success: false, error: "Invalid player ID" },
            { status: 400 }
         );
      }

      console.log(`Fetching stats for player ID: ${playerId}`);

      // First check if player exists
      const [playerCheck] = await pool.execute(
         `SELECT player_id, player_name FROM Players WHERE player_id = ?`,
         [playerId]
      );

      if ((playerCheck as any[]).length === 0) {
         return NextResponse.json(
            {
               success: false,
               error: "Player not found",
            },
            { status: 404 }
         );
      }

      console.log(`Player found: ${(playerCheck as any[])[0].player_name}`);

      // Check if there's any scorecard data at all
      const [scorecardCheck] = await pool.execute(
         `SELECT 
            (SELECT COUNT(*) FROM BattingScorecard) as total_batting_records,
            (SELECT COUNT(*) FROM BowlingScorecard) as total_bowling_records,
            (SELECT COUNT(*) FROM BattingScorecard WHERE player_id = ?) as player_batting_records,
            (SELECT COUNT(*) FROM BowlingScorecard WHERE player_id = ?) as player_bowling_records`,
         [playerId, playerId]
      );

      console.log("Scorecard data check:", (scorecardCheck as any[])[0]);

      // Let's check what player IDs actually exist in scorecards
      const [playerIdCheck] = await pool.execute(
         `SELECT 
            GROUP_CONCAT(DISTINCT bs.player_id ORDER BY bs.player_id) as batting_player_ids,
            (SELECT GROUP_CONCAT(DISTINCT bow.player_id ORDER BY bow.player_id) FROM BowlingScorecard bow LIMIT 20) as bowling_player_ids
         FROM BattingScorecard bs
         LIMIT 1`
      );

      console.log(
         "Sample player IDs in scorecards:",
         (playerIdCheck as any[])[0]
      );

      // Check player's team and see if any players from that team have scorecard data
      const [teamPlayersCheck] = await pool.execute(
         `SELECT 
            p.player_id,
            p.player_name,
            COUNT(DISTINCT bs.match_id) as batting_matches,
            COUNT(DISTINCT bow.match_id) as bowling_matches
         FROM Players p
         LEFT JOIN BattingScorecard bs ON p.player_id = bs.player_id
         LEFT JOIN BowlingScorecard bow ON p.player_id = bow.player_id
         WHERE p.team_id = (SELECT team_id FROM Players WHERE player_id = ?)
         GROUP BY p.player_id, p.player_name
         HAVING (batting_matches > 0 OR bowling_matches > 0)
         LIMIT 5`,
         [playerId]
      );

      console.log("Team players with scorecard data:", teamPlayersCheck);

      // Let's try to get stats from a broader approach - check if this player has any team matches
      const [teamMatches] = await pool.execute(
         `SELECT COUNT(DISTINCT m.match_id) as team_matches
         FROM Players p
         JOIN Teams t ON p.team_id = t.team_id
         JOIN Matches m ON (m.team1_id = t.team_id OR m.team2_id = t.team_id)
         WHERE p.player_id = ? AND m.is_completed = TRUE`,
         [playerId]
      );

      console.log("Team matches for player:", (teamMatches as any[])[0]);

      // If no scorecard data exists, let's try to get stats from PlayerStats table
      const [playerStatsData] = await pool.execute(
         `SELECT 
            ps.*,
            s.season_year
         FROM PlayerStats ps
         JOIN Series s ON ps.series_id = s.series_id
         WHERE ps.player_id = ?
         ORDER BY s.season_year DESC
         LIMIT 1`,
         [playerId]
      );

      console.log(
         "PlayerStats data:",
         (playerStatsData as any[])[0] || "No PlayerStats found"
      );

      // If we have PlayerStats data, use it
      if ((playerStatsData as any[]).length > 0) {
         const statsData = (playerStatsData as any[])[0];
         const combinedStats = {
            matches_played: Number(statsData.matches_played) || 0,
            runs_scored: Number(statsData.runs_scored) || 0,
            balls_faced: Number(statsData.balls_faced) || 0,
            fours: Number(statsData.fours) || 0,
            sixes: Number(statsData.sixes) || 0,
            highest_score: Number(statsData.highest_score) || 0,
            fifties: Number(statsData.fifties) || 0,
            hundreds: Number(statsData.hundreds) || 0,
            strike_rate:
               statsData.balls_faced > 0
                  ? Number(
                       (
                          (statsData.runs_scored / statsData.balls_faced) *
                          100
                       ).toFixed(2)
                    )
                  : 0,
            overs_bowled: Number(statsData.overs_bowled) || 0,
            runs_conceded: Number(statsData.runs_conceded) || 0,
            wickets_taken: Number(statsData.wickets_taken) || 0,
            maiden_overs: 0, // Not in PlayerStats
            economy_rate:
               statsData.overs_bowled > 0
                  ? Number(
                       (
                          statsData.runs_conceded / statsData.overs_bowled
                       ).toFixed(2)
                    )
                  : 0,
            best_bowling: statsData.best_bowling || null,
            catches: Number(statsData.catches) || 0,
            stumping: Number(statsData.stumping) || 0,
         };

         console.log("Using PlayerStats data:", combinedStats);

         return NextResponse.json({
            success: true,
            data: combinedStats,
         });
      }

      // Calculate stats directly from match data with better handling
      const [battingStats] = await pool.execute(
         `SELECT 
            COUNT(DISTINCT CASE WHEN bs.match_id IS NOT NULL THEN bs.match_id END) as matches_played_batting,
            COALESCE(SUM(bs.runs_scored), 0) as runs_scored,
            COALESCE(SUM(bs.balls_faced), 0) as balls_faced,
            COALESCE(SUM(bs.fours), 0) as fours,
            COALESCE(SUM(bs.sixes), 0) as sixes,
            COALESCE(MAX(bs.runs_scored), 0) as highest_score,
            COUNT(CASE WHEN bs.runs_scored >= 50 AND bs.runs_scored < 100 THEN 1 END) as fifties,
            COUNT(CASE WHEN bs.runs_scored >= 100 THEN 1 END) as hundreds,
            CASE 
               WHEN SUM(bs.balls_faced) > 0 THEN ROUND((SUM(bs.runs_scored) * 100.0 / SUM(bs.balls_faced)), 2)
               ELSE 0 
            END as strike_rate
         FROM Players p
         LEFT JOIN BattingScorecard bs ON p.player_id = bs.player_id
         LEFT JOIN Matches m ON bs.match_id = m.match_id AND m.is_completed = TRUE
         WHERE p.player_id = ?`,
         [playerId]
      );

      const [bowlingStats] = await pool.execute(
         `SELECT 
            COUNT(DISTINCT CASE WHEN bow.match_id IS NOT NULL THEN bow.match_id END) as matches_played_bowling,
            COALESCE(SUM(bow.overs_bowled), 0) as overs_bowled,
            COALESCE(SUM(bow.runs_conceded), 0) as runs_conceded,
            COALESCE(SUM(bow.wickets_taken), 0) as wickets_taken,
            COALESCE(SUM(bow.maiden_overs), 0) as maiden_overs,
            CASE 
               WHEN SUM(bow.overs_bowled) > 0 THEN ROUND((SUM(bow.runs_conceded) / SUM(bow.overs_bowled)), 2)
               ELSE 0 
            END as economy_rate,
            CONCAT(MAX(bow.wickets_taken), '/', MIN(CASE WHEN bow.wickets_taken > 0 THEN bow.runs_conceded ELSE NULL END)) as best_bowling
         FROM Players p
         LEFT JOIN BowlingScorecard bow ON p.player_id = bow.player_id
         LEFT JOIN Matches m ON bow.match_id = m.match_id AND m.is_completed = TRUE
         WHERE p.player_id = ?`,
         [playerId]
      );

      // Get total unique matches player has participated in
      const [totalMatches] = await pool.execute(
         `SELECT COUNT(DISTINCT m.match_id) as total_matches
         FROM Matches m
         WHERE m.is_completed = TRUE 
         AND (
            EXISTS(SELECT 1 FROM BattingScorecard bs WHERE bs.match_id = m.match_id AND bs.player_id = ?)
            OR EXISTS(SELECT 1 FROM BowlingScorecard bow WHERE bow.match_id = m.match_id AND bow.player_id = ?)
         )`,
         [playerId, playerId]
      );

      // Get additional stats (catches, stumpings) from PlayerStats if available
      const [additionalStats] = await pool.execute(
         `SELECT 
            COALESCE(SUM(ps.catches), 0) as catches,
            COALESCE(SUM(ps.stumping), 0) as stumping
         FROM PlayerStats ps
         WHERE ps.player_id = ?`,
         [playerId]
      );

      // Combine all stats
      const batting = (battingStats as any[])[0] || {};
      const bowling = (bowlingStats as any[])[0] || {};
      const total = (totalMatches as any[])[0] || {};
      const additional = (additionalStats as any[])[0] || {};

      console.log("Batting stats:", batting);
      console.log("Bowling stats:", bowling);
      console.log("Total matches:", total);
      console.log("Additional stats:", additional);

      const combinedStats = {
         matches_played: total.total_matches || 0,
         runs_scored: Number(batting.runs_scored) || 0,
         balls_faced: Number(batting.balls_faced) || 0,
         fours: Number(batting.fours) || 0,
         sixes: Number(batting.sixes) || 0,
         highest_score: Number(batting.highest_score) || 0,
         fifties: Number(batting.fifties) || 0,
         hundreds: Number(batting.hundreds) || 0,
         strike_rate: Number(batting.strike_rate) || 0,
         overs_bowled: Number(bowling.overs_bowled) || 0,
         runs_conceded: Number(bowling.runs_conceded) || 0,
         wickets_taken: Number(bowling.wickets_taken) || 0,
         maiden_overs: Number(bowling.maiden_overs) || 0,
         economy_rate: Number(bowling.economy_rate) || 0,
         best_bowling:
            bowling.best_bowling === "NULL/NULL" ? null : bowling.best_bowling,
         catches: Number(additional.catches) || 0,
         stumping: Number(additional.stumping) || 0,
      };

      console.log("Combined stats:", combinedStats);

      // If still no matches found, provide a more meaningful response
      if (combinedStats.matches_played === 0) {
         console.log(
            "No match data found - player may not have played any completed matches yet"
         );
      }

      return NextResponse.json({
         success: true,
         data: combinedStats,
         message:
            combinedStats.matches_played === 0
               ? "Player has not played any completed matches yet"
               : undefined,
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch player stats",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
