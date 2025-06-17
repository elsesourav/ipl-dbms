import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";

// GET /api/scorecards - Get all scorecards (with filters)
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const matchId = searchParams.get("matchId");
      const playerId = searchParams.get("playerId");
      const teamId = searchParams.get("teamId");
      const type = searchParams.get("type"); // 'batting' or 'bowling'
      const season = searchParams.get("season");

      if (matchId) {
         // Get detailed scorecard for a specific match
         return await getMatchScorecard(parseInt(matchId));
      }

      // Get scorecards with filters
      let battingQuery = `
      SELECT 
        bs.scorecard_id,
        bs.match_id,
        m.match_date,
        m.match_number,
        bs.player_id,
        p.player_name,
        p.role,
        bs.team_id,
        t.team_name,
        t.team_code,
        bs.batting_position,
        bs.runs_scored,
        bs.balls_faced,
        bs.fours,
        bs.sixes,
        bs.is_out,
        bs.out_type,
        bs.strike_rate,
        opp.team_name as opponent_team,
        s.season_year,
        'batting' as scorecard_type
      FROM BattingScorecard bs
      JOIN Players p ON bs.player_id = p.player_id
      JOIN Teams t ON bs.team_id = t.team_id
      JOIN Matches m ON bs.match_id = m.match_id
      JOIN Series s ON m.series_id = s.series_id
      JOIN Teams opp ON (m.team1_id = opp.team_id AND m.team1_id != bs.team_id) 
                     OR (m.team2_id = opp.team_id AND m.team2_id != bs.team_id)
      WHERE 1=1
    `;

      let bowlingQuery = `
      SELECT 
        bow.scorecard_id,
        bow.match_id,
        m.match_date,
        m.match_number,
        bow.player_id,
        p.player_name,
        p.role,
        bow.team_id,
        t.team_name,
        t.team_code,
        bow.overs_bowled,
        bow.runs_conceded,
        bow.wickets_taken,
        bow.maiden_overs,
        bow.wides,
        bow.no_balls,
        bow.economy_rate,
        opp.team_name as opponent_team,
        s.season_year,
        'bowling' as scorecard_type
      FROM BowlingScorecard bow
      JOIN Players p ON bow.player_id = p.player_id
      JOIN Teams t ON bow.team_id = t.team_id
      JOIN Matches m ON bow.match_id = m.match_id
      JOIN Series s ON m.series_id = s.series_id
      JOIN Teams opp ON (m.team1_id = opp.team_id AND m.team1_id != bow.team_id) 
                     OR (m.team2_id = opp.team_id AND m.team2_id != bow.team_id)
      WHERE 1=1
    `;

      const params: any[] = [];

      if (playerId) {
         battingQuery += " AND bs.player_id = ?";
         bowlingQuery += " AND bow.player_id = ?";
         params.push(parseInt(playerId));
      }

      if (teamId) {
         battingQuery += " AND bs.team_id = ?";
         bowlingQuery += " AND bow.team_id = ?";
         params.push(parseInt(teamId));
      }

      if (season) {
         battingQuery += " AND s.season_year = ?";
         bowlingQuery += " AND s.season_year = ?";
         params.push(parseInt(season));
      }

      let finalQuery = "";
      if (!type || type === "both") {
         finalQuery = `(${battingQuery}) UNION ALL (${bowlingQuery}) ORDER BY match_date DESC, match_id DESC`;
      } else if (type === "batting") {
         finalQuery =
            battingQuery + " ORDER BY m.match_date DESC, bs.runs_scored DESC";
      } else if (type === "bowling") {
         finalQuery =
            bowlingQuery +
            " ORDER BY m.match_date DESC, bow.wickets_taken DESC, bow.economy_rate ASC";
      }

      const [rows] = await pool.execute<RowDataPacket[]>(finalQuery, [
         ...params,
         ...params,
      ]);

      return NextResponse.json({
         success: true,
         data: rows,
         count: rows.length,
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch scorecards",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

async function getMatchScorecard(matchId: number) {
   try {
      // Get match details
      const matchQuery = `
      SELECT 
        m.*,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        s.stadium_name,
        s.city,
        winner.team_name as winner_name,
        mom.player_name as man_of_match_name
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Stadiums s ON m.stadium_id = s.stadium_id
      LEFT JOIN Teams winner ON m.winner_id = winner.team_id
      LEFT JOIN Players mom ON m.man_of_match_id = mom.player_id
      WHERE m.match_id = ?
    `;

      // Get batting scorecard
      const battingQuery = `
      SELECT 
        bs.*,
        p.player_name,
        p.role,
        bowler.player_name as bowler_name,
        fielder.player_name as fielder_name
      FROM BattingScorecard bs
      JOIN Players p ON bs.player_id = p.player_id
      LEFT JOIN Players bowler ON bs.bowler_id = bowler.player_id
      LEFT JOIN Players fielder ON bs.fielder_id = fielder.player_id
      WHERE bs.match_id = ?
      ORDER BY bs.team_id, bs.batting_position
    `;

      // Get bowling scorecard
      const bowlingQuery = `
      SELECT 
        bow.*,
        p.player_name,
        p.role
      FROM BowlingScorecard bow
      JOIN Players p ON bow.player_id = p.player_id
      WHERE bow.match_id = ?
      ORDER BY bow.team_id, bow.wickets_taken DESC, bow.economy_rate ASC
    `;

      const [matchDetails] = await pool.execute<RowDataPacket[]>(matchQuery, [
         matchId,
      ]);
      const [battingScorecard] = await pool.execute<RowDataPacket[]>(
         battingQuery,
         [matchId]
      );
      const [bowlingScorecard] = await pool.execute<RowDataPacket[]>(
         bowlingQuery,
         [matchId]
      );

      if (matchDetails.length === 0) {
         return NextResponse.json(
            { success: false, error: "Match not found" },
            { status: 404 }
         );
      }

      const match = matchDetails[0];

      // Group batting scorecard by team
      const team1Batting = battingScorecard.filter(
         (b) => b.team_id === match.team1_id
      );
      const team2Batting = battingScorecard.filter(
         (b) => b.team_id === match.team2_id
      );

      // Group bowling scorecard by team
      const team1Bowling = bowlingScorecard.filter(
         (b) => b.team_id === match.team1_id
      );
      const team2Bowling = bowlingScorecard.filter(
         (b) => b.team_id === match.team2_id
      );

      // Calculate team totals
      const team1Total = {
         runs: team1Batting.reduce((sum, b) => sum + b.runs_scored, 0),
         wickets: team1Batting.filter((b) => b.is_out).length,
         balls: team1Batting.reduce((sum, b) => sum + b.balls_faced, 0),
      };

      const team2Total = {
         runs: team2Batting.reduce((sum, b) => sum + b.runs_scored, 0),
         wickets: team2Batting.filter((b) => b.is_out).length,
         balls: team2Batting.reduce((sum, b) => sum + b.balls_faced, 0),
      };

      return NextResponse.json({
         success: true,
         data: {
            match: match,
            scorecard: {
               team1: {
                  team_info: {
                     team_id: match.team1_id,
                     team_name: match.team1_name,
                     team_code: match.team1_code,
                  },
                  batting: team1Batting,
                  bowling: team1Bowling,
                  total: team1Total,
               },
               team2: {
                  team_info: {
                     team_id: match.team2_id,
                     team_name: match.team2_name,
                     team_code: match.team2_code,
                  },
                  batting: team2Batting,
                  bowling: team2Bowling,
                  total: team2Total,
               },
            },
         },
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch match scorecard",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
