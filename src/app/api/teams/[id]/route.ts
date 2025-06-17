import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "./../../../../lib/db";

interface Team extends RowDataPacket {
   team_id: number;
   team_name: string;
   team_code: string;
   city: string;
   founded_year: number;
   owner: string;
   coach: string;
   home_ground: string;
   team_color: string;
   is_active: boolean;
   created_at: string;
   updated_at: string;
}

interface TeamWithStats extends Team {
   total_matches: number;
   wins: number;
   losses: number;
   current_season_points: number;
   current_season_nrr: number;
}

// GET /api/teams/[id] - Get team details with statistics
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const teamId = parseInt(params.id);

      if (isNaN(teamId)) {
         return NextResponse.json(
            { success: false, error: "Invalid team ID" },
            { status: 400 }
         );
      }

      // Get team details with current season stats
      const query = `
      SELECT 
        t.*,
        COALESCE(ts.matches_played, 0) as total_matches,
        COALESCE(ts.matches_won, 0) as wins,
        COALESCE(ts.matches_lost, 0) as losses,
        COALESCE(ts.points, 0) as current_season_points,
        COALESCE(ts.net_run_rate, 0.00) as current_season_nrr,
        s.season_year as current_season
      FROM Teams t
      LEFT JOIN TeamStats ts ON t.team_id = ts.team_id
      LEFT JOIN Series s ON ts.series_id = s.series_id AND s.is_completed = false
      WHERE t.team_id = ?
    `;

      const [rows] = await pool.execute<TeamWithStats[]>(query, [teamId]);

      if (rows.length === 0) {
         return NextResponse.json(
            { success: false, error: "Team not found" },
            { status: 404 }
         );
      }

      const team = rows[0];

      // Get additional team information
      const [playerCount] = await pool.execute<RowDataPacket[]>(
         `SELECT COUNT(DISTINCT pc.player_id) as player_count
       FROM PlayerContracts pc
       JOIN Series s ON pc.series_id = s.series_id
       WHERE pc.team_id = ? AND s.is_completed = false`,
         [teamId]
      );

      const [homeGround] = await pool.execute<RowDataPacket[]>(
         `SELECT stadium_name, city, capacity
       FROM Stadiums
       WHERE stadium_name = ? OR stadium_id IN (
         SELECT stadium_id FROM Matches WHERE team1_id = ? OR team2_id = ?
       )
       LIMIT 1`,
         [team.home_ground, teamId, teamId]
      );

      return NextResponse.json({
         success: true,
         data: {
            ...team,
            current_players: playerCount[0]?.player_count || 0,
            home_stadium: homeGround[0] || null,
         },
      });
   } catch (error) {
      console.error("Error fetching team details:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch team details" },
         { status: 500 }
      );
   }
}

// PUT /api/teams/[id] - Update team details (admin only)
export async function PUT(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const teamId = parseInt(params.id);
      const body = await request.json();

      if (isNaN(teamId)) {
         return NextResponse.json(
            { success: false, error: "Invalid team ID" },
            { status: 400 }
         );
      }

      const {
         team_name,
         team_code,
         city,
         founded_year,
         owner,
         coach,
         home_ground,
         team_color,
         is_active,
      } = body;

      // Check if team exists
      const [existingTeam] = await pool.execute<Team[]>(
         "SELECT team_id FROM Teams WHERE team_id = ?",
         [teamId]
      );

      if (existingTeam.length === 0) {
         return NextResponse.json(
            { success: false, error: "Team not found" },
            { status: 404 }
         );
      }

      const updateFields: string[] = [];
      const updateValues: any[] = [];

      if (team_name !== undefined) {
         updateFields.push("team_name = ?");
         updateValues.push(team_name);
      }
      if (team_code !== undefined) {
         updateFields.push("team_code = ?");
         updateValues.push(team_code);
      }
      if (city !== undefined) {
         updateFields.push("city = ?");
         updateValues.push(city);
      }
      if (founded_year !== undefined) {
         updateFields.push("founded_year = ?");
         updateValues.push(founded_year);
      }
      if (owner !== undefined) {
         updateFields.push("owner = ?");
         updateValues.push(owner);
      }
      if (coach !== undefined) {
         updateFields.push("coach = ?");
         updateValues.push(coach);
      }
      if (home_ground !== undefined) {
         updateFields.push("home_ground = ?");
         updateValues.push(home_ground);
      }
      if (team_color !== undefined) {
         updateFields.push("team_color = ?");
         updateValues.push(team_color);
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

      updateValues.push(teamId);

      const query = `
      UPDATE Teams 
      SET ${updateFields.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE team_id = ?
    `;

      await pool.execute<ResultSetHeader>(query, updateValues);

      // Fetch updated team
      const [updatedTeam] = await pool.execute<Team[]>(
         "SELECT * FROM Teams WHERE team_id = ?",
         [teamId]
      );

      return NextResponse.json({
         success: true,
         data: updatedTeam[0],
         message: "Team updated successfully",
      });
   } catch (error: any) {
      console.error("Error updating team:", error);

      if (error.code === "ER_DUP_ENTRY") {
         return NextResponse.json(
            { success: false, error: "Team code already exists" },
            { status: 409 }
         );
      }

      return NextResponse.json(
         { success: false, error: "Failed to update team" },
         { status: 500 }
      );
   }
}

// DELETE /api/teams/[id] - Delete team (admin only)
export async function DELETE(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const teamId = parseInt(params.id);

      if (isNaN(teamId)) {
         return NextResponse.json(
            { success: false, error: "Invalid team ID" },
            { status: 400 }
         );
      }

      // Check if team exists
      const [existingTeam] = await pool.execute<Team[]>(
         "SELECT team_id FROM Teams WHERE team_id = ?",
         [teamId]
      );

      if (existingTeam.length === 0) {
         return NextResponse.json(
            { success: false, error: "Team not found" },
            { status: 404 }
         );
      }

      // Check if team has any matches
      const [matchCount] = await pool.execute<RowDataPacket[]>(
         "SELECT COUNT(*) as count FROM Matches WHERE team1_id = ? OR team2_id = ?",
         [teamId, teamId]
      );

      if (matchCount[0].count > 0) {
         return NextResponse.json(
            {
               success: false,
               error: "Cannot delete team with existing matches. Consider deactivating instead.",
            },
            { status: 409 }
         );
      }

      await pool.execute<ResultSetHeader>(
         "DELETE FROM Teams WHERE team_id = ?",
         [teamId]
      );

      return NextResponse.json({
         success: true,
         message: "Team deleted successfully",
      });
   } catch (error) {
      console.error("Error deleting team:", error);
      return NextResponse.json(
         { success: false, error: "Failed to delete team" },
         { status: 500 }
      );
   }
}
