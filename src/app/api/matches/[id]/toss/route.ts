import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/matches/[id]/toss - Get toss details
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

      // Get match and toss details
      const tossQuery = `
      SELECT 
        m.match_id,
        m.match_date,
        m.match_time,
        m.toss_winner_id,
        m.toss_decision,
        m.status,
        t1.team_name as team1_name,
        t1.team_code as team1_code,
        t1.primary_color as team1_color,
        t2.team_name as team2_name,
        t2.team_code as team2_code,
        t2.primary_color as team2_color,
        tw.team_name as toss_winner_name,
        tw.team_code as toss_winner_code,
        tw.primary_color as toss_winner_color,
        s.stadium_name,
        s.city as stadium_city,
        m.first_innings_team_id,
        fit.team_name as first_innings_team_name,
        fit.team_code as first_innings_team_code
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      LEFT JOIN teams tw ON m.toss_winner_id = tw.team_id
      LEFT JOIN teams fit ON m.first_innings_team_id = fit.team_id
      LEFT JOIN stadiums s ON m.stadium_id = s.stadium_id
      WHERE m.match_id = ?
    `;

      const [tossResult] = await pool.execute<RowDataPacket[]>(tossQuery, [
         matchId,
      ]);

      if (!tossResult || tossResult.length === 0) {
         return NextResponse.json(
            { success: false, error: "Match not found" },
            { status: 404 }
         );
      }

      const match = tossResult[0];

      // Check if toss has happened
      if (!match.toss_winner_id) {
         return NextResponse.json({
            success: true,
            data: {
               match_info: {
                  match_id: match.match_id,
                  match_date: match.match_date,
                  match_time: match.match_time,
                  status: match.status,
                  team1: {
                     name: match.team1_name,
                     code: match.team1_code,
                     color: match.team1_color,
                  },
                  team2: {
                     name: match.team2_name,
                     code: match.team2_code,
                     color: match.team2_color,
                  },
                  venue: {
                     stadium_name: match.stadium_name,
                     city: match.stadium_city,
                  },
               },
               toss_completed: false,
               message: "Toss has not taken place yet",
            },
         });
      }

      // Get weather conditions at toss time (if available)
      const weatherQuery = `
      SELECT 
        temperature,
        humidity,
        wind_speed,
        weather_condition,
        pitch_condition,
        recorded_at
      FROM match_weather 
      WHERE match_id = ? 
      ORDER BY recorded_at ASC 
      LIMIT 1
    `;

      const [weatherResult] = await pool.execute<RowDataPacket[]>(
         weatherQuery,
         [matchId]
      );

      // Get captains information
      const captainsQuery = `
      SELECT 
        ms.team_id,
        t.team_name,
        t.team_code,
        ms.captain_id,
        p.player_name as captain_name,
        ms.vice_captain_id,
        vp.player_name as vice_captain_name
      FROM match_squads ms
      JOIN teams t ON ms.team_id = t.team_id
      JOIN players p ON ms.captain_id = p.player_id
      LEFT JOIN players vp ON ms.vice_captain_id = vp.player_id
      WHERE ms.match_id = ?
      ORDER BY ms.team_id
    `;

      const [captainsResult] = await pool.execute<RowDataPacket[]>(
         captainsQuery,
         [matchId]
      );

      return NextResponse.json({
         success: true,
         data: {
            match_info: {
               match_id: match.match_id,
               match_date: match.match_date,
               match_time: match.match_time,
               status: match.status,
               team1: {
                  name: match.team1_name,
                  code: match.team1_code,
                  color: match.team1_color,
               },
               team2: {
                  name: match.team2_name,
                  code: match.team2_code,
                  color: match.team2_color,
               },
               venue: {
                  stadium_name: match.stadium_name,
                  city: match.stadium_city,
               },
            },
            toss_completed: true,
            toss_details: {
               winner: {
                  team_id: match.toss_winner_id,
                  name: match.toss_winner_name,
                  code: match.toss_winner_code,
                  color: match.toss_winner_color,
               },
               decision: match.toss_decision,
               first_innings_team: {
                  team_id: match.first_innings_team_id,
                  name: match.first_innings_team_name,
                  code: match.first_innings_team_code,
               },
            },
            weather_conditions:
               weatherResult && weatherResult.length > 0
                  ? weatherResult[0]
                  : null,
            captains: captainsResult || [],
         },
      });
   } catch (error) {
      console.error("Error fetching toss details:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch toss details" },
         { status: 500 }
      );
   }
}
