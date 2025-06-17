import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../../lib/db";

// GET /api/matches/[id] - Get match details
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const matchId = parseInt(params.id);

      if (isNaN(matchId)) {
         return NextResponse.json(
            { success: false, error: "Invalid match ID" },
            { status: 400 }
         );
      }

      // Get comprehensive match details
      const matchQuery = `
      SELECT 
        m.*,
        se.series_name,
        se.season_year,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t1.team_color as team1_color,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        t2.team_color as team2_color,
        s.stadium_name,
        s.city as venue_city,
        s.state as venue_state,
        s.capacity as venue_capacity,
        tw.team_name as toss_winner_name,
        tw.team_code as toss_winner_code,
        w.team_name as winner_name,
        w.team_code as winner_code,
        mom.player_name as man_of_match_name,
        u1.umpire_name as umpire1_name,
        u2.umpire_name as umpire2_name,
        u3.umpire_name as third_umpire_name
      FROM Matches m
      JOIN Series se ON m.series_id = se.series_id
      JOIN Teams t1 ON m.team1_id = t1.team_id
      JOIN Teams t2 ON m.team2_id = t2.team_id
      JOIN Stadiums s ON m.stadium_id = s.stadium_id
      LEFT JOIN Teams tw ON m.toss_winner_id = tw.team_id
      LEFT JOIN Teams w ON m.winner_id = w.team_id
      LEFT JOIN Players mom ON m.man_of_match_id = mom.player_id
      LEFT JOIN Umpires u1 ON m.umpire1_id = u1.umpire_id
      LEFT JOIN Umpires u2 ON m.umpire2_id = u2.umpire_id
      LEFT JOIN Umpires u3 ON m.third_umpire_id = u3.umpire_id
      WHERE m.match_id = ?
    `;

      const [matchRows] = await pool.execute<RowDataPacket[]>(matchQuery, [
         matchId,
      ]);

      if (matchRows.length === 0) {
         return NextResponse.json(
            { success: false, error: "Match not found" },
            { status: 404 }
         );
      }

      const match = matchRows[0];

      // Get team squads
      const squadQuery = `
      SELECT 
        ts.team_id,
        t.team_name,
        t.team_code,
        ts.player_id,
        p.player_name,
        p.role,
        ts.is_playing_xi,
        ts.is_impact_player_option,
        ts.jersey_number,
        pc.is_captain,
        pc.is_vice_captain
      FROM TeamSquads ts
      JOIN Players p ON ts.player_id = p.player_id
      JOIN Teams t ON ts.team_id = t.team_id
      JOIN PlayerContracts pc ON p.player_id = pc.player_id AND pc.team_id = ts.team_id AND pc.series_id = ?
      WHERE ts.match_id = ?
      ORDER BY ts.team_id, ts.is_playing_xi DESC, p.player_name
    `;

      const [squadRows] = await pool.execute<RowDataPacket[]>(squadQuery, [
         match.series_id,
         matchId,
      ]);

      // Group squads by team
      const team1Squad = squadRows.filter((s) => s.team_id === match.team1_id);
      const team2Squad = squadRows.filter((s) => s.team_id === match.team2_id);

      // Get scorecards if match is completed
      let scorecards: any = null;
      if (match.is_completed) {
         // Batting scorecard
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

         // Bowling scorecard
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

         const [battingScorecard] = await pool.execute<RowDataPacket[]>(
            battingQuery,
            [matchId]
         );
         const [bowlingScorecard] = await pool.execute<RowDataPacket[]>(
            bowlingQuery,
            [matchId]
         );

         // Group scorecards by team
         const team1Batting = battingScorecard.filter(
            (b) => b.team_id === match.team1_id
         );
         const team2Batting = battingScorecard.filter(
            (b) => b.team_id === match.team2_id
         );
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
            fours: team1Batting.reduce((sum, b) => sum + b.fours, 0),
            sixes: team1Batting.reduce((sum, b) => sum + b.sixes, 0),
         };

         const team2Total = {
            runs: team2Batting.reduce((sum, b) => sum + b.runs_scored, 0),
            wickets: team2Batting.filter((b) => b.is_out).length,
            balls: team2Batting.reduce((sum, b) => sum + b.balls_faced, 0),
            fours: team2Batting.reduce((sum, b) => sum + b.fours, 0),
            sixes: team2Batting.reduce((sum, b) => sum + b.sixes, 0),
         };

         scorecards = {
            team1: {
               batting: team1Batting,
               bowling: team1Bowling,
               total: team1Total,
            },
            team2: {
               batting: team2Batting,
               bowling: team2Bowling,
               total: team2Total,
            },
         };
      }

      // Get advanced features if applicable
      let advancedFeatures: any = null;

      // Check for super over
      const superOverQuery = "SELECT * FROM SuperOvers WHERE match_id = ?";
      const [superOvers] = await pool.execute<RowDataPacket[]>(superOverQuery, [
         matchId,
      ]);

      // Check for impact player substitutions
      const impactPlayerQuery = `
      SELECT 
        ips.*,
        op.player_name as original_player_name,
        ip.player_name as impact_player_name,
        t.team_name,
        t.team_code
      FROM ImpactPlayerSubstitutions ips
      JOIN Players op ON ips.original_player_id = op.player_id
      JOIN Players ip ON ips.impact_player_id = ip.player_id
      JOIN Teams t ON ips.team_id = t.team_id
      WHERE ips.match_id = ?
    `;
      const [impactPlayers] = await pool.execute<RowDataPacket[]>(
         impactPlayerQuery,
         [matchId]
      );

      // Check for DLS applications
      const dlsQuery = "SELECT * FROM DLSApplications WHERE match_id = ?";
      const [dlsApplications] = await pool.execute<RowDataPacket[]>(dlsQuery, [
         matchId,
      ]);

      if (
         superOvers.length > 0 ||
         impactPlayers.length > 0 ||
         dlsApplications.length > 0
      ) {
         advancedFeatures = {
            super_over: superOvers[0] || null,
            impact_player_substitutions: impactPlayers,
            dls_application: dlsApplications[0] || null,
         };
      }

      return NextResponse.json({
         success: true,
         data: {
            match: match,
            squads: {
               team1: team1Squad,
               team2: team2Squad,
            },
            scorecards: scorecards,
            advanced_features: advancedFeatures,
         },
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch match details",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// PUT /api/matches/[id] - Update match (admin only)
export async function PUT(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const matchId = parseInt(params.id);

      if (isNaN(matchId)) {
         return NextResponse.json(
            { success: false, error: "Invalid match ID" },
            { status: 400 }
         );
      }

      const body = await request.json();
      const updates: string[] = [];
      const values: any[] = [];

      // List of updatable fields
      const updatableFields = [
         "match_date",
         "match_time",
         "match_status",
         "toss_winner_id",
         "toss_decision",
         "winner_id",
         "win_type",
         "win_margin",
         "man_of_match_id",
         "weather_conditions",
         "pitch_conditions",
         "temperature_celsius",
         "humidity_percent",
         "wind_speed_kmh",
         "is_day_night",
         "has_dew",
         "super_over_required",
         "impact_player_used_team1",
         "impact_player_used_team2",
         "is_completed",
      ];

      for (const field of updatableFields) {
         if (body[field] !== undefined) {
            updates.push(`${field} = ?`);
            values.push(body[field]);
         }
      }

      if (updates.length === 0) {
         return NextResponse.json(
            { success: false, error: "No fields to update" },
            { status: 400 }
         );
      }

      // Check if match exists
      const checkQuery = "SELECT match_id FROM Matches WHERE match_id = ?";
      const [existing] = await pool.execute<RowDataPacket[]>(checkQuery, [
         matchId,
      ]);

      if (existing.length === 0) {
         return NextResponse.json(
            { success: false, error: "Match not found" },
            { status: 404 }
         );
      }

      values.push(matchId);

      const updateQuery = `
      UPDATE Matches 
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE match_id = ?
    `;

      await pool.execute<ResultSetHeader>(updateQuery, values);

      return NextResponse.json({
         success: true,
         message: "Match updated successfully",
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to update match",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// DELETE /api/matches/[id] - Delete match (admin only)
export async function DELETE(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const matchId = parseInt(params.id);

      if (isNaN(matchId)) {
         return NextResponse.json(
            { success: false, error: "Invalid match ID" },
            { status: 400 }
         );
      }

      // Check if match exists
      const checkQuery =
         "SELECT match_id, match_number FROM Matches WHERE match_id = ?";
      const [existing] = await pool.execute<RowDataPacket[]>(checkQuery, [
         matchId,
      ]);

      if (existing.length === 0) {
         return NextResponse.json(
            { success: false, error: "Match not found" },
            { status: 404 }
         );
      }

      // Check if match has scorecards (prevent deletion if match has been played)
      const scorecardsQuery =
         "SELECT COUNT(*) as scorecard_count FROM BattingScorecard WHERE match_id = ?";
      const [scorecardsResult] = await pool.execute<RowDataPacket[]>(
         scorecardsQuery,
         [matchId]
      );

      if (scorecardsResult[0].scorecard_count > 0) {
         return NextResponse.json(
            {
               success: false,
               error: "Cannot delete match with existing scorecards",
               scorecards_count: scorecardsResult[0].scorecard_count,
            },
            { status: 409 }
         );
      }

      // Delete match (cascade will handle related data)
      const deleteQuery = "DELETE FROM Matches WHERE match_id = ?";
      await pool.execute<ResultSetHeader>(deleteQuery, [matchId]);

      return NextResponse.json({
         success: true,
         message: "Match deleted successfully",
         data: {
            match_id: matchId,
            match_number: existing[0].match_number,
         },
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to delete match",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
