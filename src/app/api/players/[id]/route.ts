import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";
import { formatCurrency, formatDate } from "../../../../lib/utils";

interface Player extends RowDataPacket {
   player_id: number;
   player_name: string;
   date_of_birth: string;
   nationality: string;
   role: string;
   batting_style: string;
   bowling_style: string;
   is_active: boolean;
   created_at: string;
   updated_at: string;
}

interface PlayerDetails extends Player {
   current_team_id: number;
   current_team_name: string;
   current_team_code: string;
   jersey_number: number;
   price_crores: number;
   is_captain: boolean;
   is_vice_captain: boolean;
   total_matches: number;
   total_runs: number;
   total_wickets: number;
   career_average: number;
   career_strike_rate: number;
   career_economy: number;
   highest_score: number;
   best_bowling: string;
}

// GET /api/players/[id] - Get player details
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

      // Get player details with current team info
      const [playerResult] = await pool.execute<PlayerDetails[]>(
         `
      SELECT 
        p.*,
        pc.team_id as current_team_id,
        t.team_name as current_team_name,
        t.team_code as current_team_code,
        pc.jersey_number,
        pc.price_crores,
        pc.is_captain,
        pc.is_vice_captain,
        s.season_year as current_season
      FROM Players p
      LEFT JOIN PlayerContracts pc ON p.player_id = pc.player_id
      LEFT JOIN Teams t ON pc.team_id = t.team_id
      LEFT JOIN Series s ON pc.series_id = s.series_id AND s.is_completed = false
      WHERE p.player_id = ?
      ORDER BY s.season_year DESC
      LIMIT 1
    `,
         [playerId]
      );

      if (playerResult.length === 0) {
         return NextResponse.json(
            { success: false, error: "Player not found" },
            { status: 404 }
         );
      }

      const player = playerResult[0];

      // Get career batting statistics
      const [battingStats] = await pool.execute<RowDataPacket[]>(
         `
      SELECT 
        COUNT(DISTINCT bs.match_id) as total_matches,
        SUM(bs.runs_scored) as total_runs,
        SUM(bs.balls_faced) as total_balls,
        SUM(bs.fours) as total_fours,
        SUM(bs.sixes) as total_sixes,
        MAX(bs.runs_scored) as highest_score,
        COUNT(CASE WHEN bs.runs_scored >= 50 THEN 1 END) as fifties,
        COUNT(CASE WHEN bs.runs_scored >= 100 THEN 1 END) as hundreds,
        ROUND(AVG(CASE WHEN bs.is_out = true THEN bs.runs_scored END), 2) as batting_average,
        ROUND(AVG(bs.strike_rate), 2) as career_strike_rate,
        COUNT(CASE WHEN bs.is_out = false THEN 1 END) as not_outs
      FROM BattingScorecard bs
      JOIN Matches m ON bs.match_id = m.match_id
      WHERE bs.player_id = ? AND m.is_completed = true
    `,
         [playerId]
      );

      // Get career bowling statistics
      const [bowlingStats] = await pool.execute<RowDataPacket[]>(
         `
      SELECT 
        COUNT(DISTINCT bow.match_id) as matches_bowled,
        SUM(bow.overs_bowled) as total_overs,
        SUM(bow.runs_conceded) as runs_conceded,
        SUM(bow.wickets_taken) as total_wickets,
        SUM(bow.maiden_overs) as maiden_overs,
        ROUND(AVG(bow.economy_rate), 2) as career_economy,
        MAX(bow.wickets_taken) as best_bowling_wickets,
        MIN(CASE WHEN bow.wickets_taken = (SELECT MAX(wickets_taken) FROM BowlingScorecard WHERE player_id = ?) 
            THEN bow.runs_conceded END) as best_bowling_runs,
        COUNT(CASE WHEN bow.wickets_taken >= 3 THEN 1 END) as three_wicket_hauls,
        COUNT(CASE WHEN bow.wickets_taken >= 5 THEN 1 END) as five_wicket_hauls
      FROM BowlingScorecard bow
      JOIN Matches m ON bow.match_id = m.match_id
      WHERE bow.player_id = ? AND m.is_completed = true
    `,
         [playerId, playerId]
      );

      // Get recent performances (last 10 matches)
      const [recentPerformances] = await pool.execute<RowDataPacket[]>(
         `
      SELECT 
        m.match_id,
        m.match_date,
        CONCAT(t1.team_code, ' vs ', t2.team_code) as match_info,
        t1.team_name as team1_name,
        t2.team_name as team2_name,
        bs.runs_scored as batting_runs,
        bs.balls_faced as batting_balls,
        bs.strike_rate as batting_sr,
        bow.wickets_taken as bowling_wickets,
        bow.runs_conceded as bowling_runs,
        bow.overs_bowled as bowling_overs,
        bow.economy_rate as bowling_economy,
        CASE WHEN m.man_of_match_id = ? THEN true ELSE false END as man_of_match
      FROM Matches m
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      LEFT JOIN BattingScorecard bs ON m.match_id = bs.match_id AND bs.player_id = ?
      LEFT JOIN BowlingScorecard bow ON m.match_id = bow.match_id AND bow.player_id = ?
      WHERE (bs.player_id = ? OR bow.player_id = ?) AND m.is_completed = true
      ORDER BY m.match_date DESC
      LIMIT 10
    `,
         [playerId, playerId, playerId, playerId, playerId]
      );

      // Get team history
      const [teamHistory] = await pool.execute<RowDataPacket[]>(
         `
      SELECT 
        t.team_name,
        t.team_code,
        s.season_year,
        s.series_name,
        pc.price_crores,
        pc.contract_type,
        pc.is_captain,
        pc.is_vice_captain,
        pc.jersey_number
      FROM PlayerContracts pc
      JOIN Teams t ON pc.team_id = t.team_id
      JOIN Series s ON pc.series_id = s.series_id
      WHERE pc.player_id = ?
      ORDER BY s.season_year DESC
    `,
         [playerId]
      );

      // Get auction history
      const [auctionHistory] = await pool.execute<RowDataPacket[]>(
         `
      SELECT 
        pah.auction_type,
        pah.base_price_crores,
        pah.sold_price_crores,
        pah.auction_date,
        t.team_name,
        t.team_code,
        s.season_year
      FROM PlayerAuctionHistory pah
      LEFT JOIN Teams t ON pah.team_id = t.team_id
      JOIN Series s ON pah.series_id = s.series_id
      WHERE pah.player_id = ?
      ORDER BY s.season_year DESC
    `,
         [playerId]
      );

      return NextResponse.json({
         success: true,
         data: {
            player: {
               ...player,
               formatted_dob: player.date_of_birth
                  ? formatDate(player.date_of_birth)
                  : null,
               age: player.date_of_birth
                  ? Math.floor(
                       (Date.now() - new Date(player.date_of_birth).getTime()) /
                          (365.25 * 24 * 60 * 60 * 1000)
                    )
                  : null,
               formatted_price: player.price_crores
                  ? formatCurrency(player.price_crores)
                  : null,
            },
            careerStats: {
               batting: battingStats[0],
               bowling: bowlingStats[0],
            },
            recentPerformances: recentPerformances.map((perf) => ({
               ...perf,
               formatted_date: formatDate(perf.match_date),
            })),
            teamHistory: teamHistory.map((history) => ({
               ...history,
               formatted_price: history.price_crores
                  ? formatCurrency(history.price_crores)
                  : null,
            })),
            auctionHistory: auctionHistory.map((auction) => ({
               ...auction,
               formatted_base_price: auction.base_price_crores
                  ? formatCurrency(auction.base_price_crores)
                  : null,
               formatted_sold_price: auction.sold_price_crores
                  ? formatCurrency(auction.sold_price_crores)
                  : null,
               formatted_date: auction.auction_date
                  ? formatDate(auction.auction_date)
                  : null,
            })),
         },
      });
   } catch (error) {
      console.error("Error fetching player details:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch player details" },
         { status: 500 }
      );
   }
}

// PUT /api/players/[id] - Update player details (admin only)
export async function PUT(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const playerId = parseInt(params.id);
      const body = await request.json();

      if (isNaN(playerId)) {
         return NextResponse.json(
            { success: false, error: "Invalid player ID" },
            { status: 400 }
         );
      }

      const {
         player_name,
         date_of_birth,
         nationality,
         role,
         batting_style,
         bowling_style,
         is_active,
      } = body;

      // Check if player exists
      const [existingPlayer] = await pool.execute<Player[]>(
         "SELECT player_id FROM Players WHERE player_id = ?",
         [playerId]
      );

      if (existingPlayer.length === 0) {
         return NextResponse.json(
            { success: false, error: "Player not found" },
            { status: 404 }
         );
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (player_name !== undefined) {
         updateFields.push("player_name = ?");
         updateValues.push(player_name);
      }
      if (date_of_birth !== undefined) {
         updateFields.push("date_of_birth = ?");
         updateValues.push(date_of_birth);
      }
      if (nationality !== undefined) {
         updateFields.push("nationality = ?");
         updateValues.push(nationality);
      }
      if (role !== undefined) {
         const validRoles = [
            "Batsman",
            "Bowler",
            "All-rounder",
            "Wicket-keeper",
         ];
         if (!validRoles.includes(role)) {
            return NextResponse.json(
               { success: false, error: "Invalid role" },
               { status: 400 }
            );
         }
         updateFields.push("role = ?");
         updateValues.push(role);
      }
      if (batting_style !== undefined) {
         if (
            batting_style &&
            !["Right-handed", "Left-handed"].includes(batting_style)
         ) {
            return NextResponse.json(
               { success: false, error: "Invalid batting style" },
               { status: 400 }
            );
         }
         updateFields.push("batting_style = ?");
         updateValues.push(batting_style);
      }
      if (bowling_style !== undefined) {
         updateFields.push("bowling_style = ?");
         updateValues.push(bowling_style);
      }
      if (is_active !== undefined) {
         updateFields.push("is_active = ?");
         updateValues.push(is_active);
      }

      if (updateFields.length === 0) {
         return NextResponse.json(
            { success: false, error: "No fields to update" },
            { status: 400 }
         );
      }

      updateValues.push(playerId);

      const query = `
      UPDATE Players 
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE player_id = ?
    `;

      await pool.execute<ResultSetHeader>(query, updateValues);

      // Fetch updated player
      const [updatedPlayer] = await pool.execute<Player[]>(
         "SELECT * FROM Players WHERE player_id = ?",
         [playerId]
      );

      return NextResponse.json({
         success: true,
         data: updatedPlayer[0],
         message: "Player updated successfully",
      });
   } catch (error) {
      console.error("Error updating player:", error);
      return NextResponse.json(
         { success: false, error: "Failed to update player" },
         { status: 500 }
      );
   }
}

// DELETE /api/players/[id] - Delete player (admin only)
export async function DELETE(
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

      // Check if player exists
      const [existingPlayer] = await pool.execute<Player[]>(
         "SELECT player_id FROM Players WHERE player_id = ?",
         [playerId]
      );

      if (existingPlayer.length === 0) {
         return NextResponse.json(
            { success: false, error: "Player not found" },
            { status: 404 }
         );
      }

      // Check if player has any match records
      const [matchCount] = await pool.execute<RowDataPacket[]>(
         `SELECT COUNT(*) as count FROM (
        SELECT match_id FROM BattingScorecard WHERE player_id = ?
        UNION
        SELECT match_id FROM BowlingScorecard WHERE player_id = ?
      ) matches`,
         [playerId, playerId]
      );

      if (matchCount[0].count > 0) {
         return NextResponse.json(
            {
               success: false,
               error: "Cannot delete player with existing match records. Consider deactivating instead.",
            },
            { status: 409 }
         );
      }

      await pool.execute<ResultSetHeader>(
         "DELETE FROM Players WHERE player_id = ?",
         [playerId]
      );

      return NextResponse.json({
         success: true,
         message: "Player deleted successfully",
      });
   } catch (error) {
      console.error("Error deleting player:", error);
      return NextResponse.json(
         { success: false, error: "Failed to delete player" },
         { status: 500 }
      );
   }
}
