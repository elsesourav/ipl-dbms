import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/teams/[id]/stats - Get team statistics
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const teamId = parseInt(params.id);
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");

      // Check if team exists
      const teamQuery = `
      SELECT team_id, team_name, team_code
      FROM teams 
      WHERE team_id = ? AND is_active = true
    `;

      const [teamInfo] = await pool.execute(teamQuery, [teamId]);

      if ((teamInfo as any[]).length === 0) {
         return NextResponse.json(
            { success: false, error: "Team not found" },
            { status: 404 }
         );
      }

      const team = (teamInfo as any[])[0];

      // Get team stats
      let whereClause = "ts.team_id = ?";
      let queryParams: any[] = [teamId];

      if (season) {
         whereClause += " AND ts.season = ?";
         queryParams.push(season);
      }

      const statsQuery = `
      SELECT 
        ts.*,
        se.series_name,
        RANK() OVER (
          PARTITION BY ts.season 
          ORDER BY ts.points DESC, ts.net_run_rate DESC
        ) as position
      FROM team_stats ts
      JOIN series se ON ts.season = se.season
      WHERE ${whereClause}
      ORDER BY ts.season DESC
    `;

      const [stats] = await pool.execute(statsQuery, queryParams);

      // Get head-to-head records against all teams
      const h2hQuery = `
      SELECT 
        opp.team_id as opponent_id,
        opp.team_name as opponent_name,
        opp.team_code as opponent_code,
        COUNT(*) as total_matches,
        SUM(CASE 
          WHEN m.result LIKE CONCAT(?, '%') THEN 1 
          ELSE 0 
        END) as wins,
        SUM(CASE 
          WHEN m.result LIKE CONCAT(opp.team_name, '%') THEN 1 
          ELSE 0 
        END) as losses
      FROM matches m
      JOIN teams opp ON (
        CASE 
          WHEN m.team1_id = ? THEN m.team2_id 
          ELSE m.team1_id 
        END = opp.team_id
      )
      JOIN series se ON m.series_id = se.series_id
      WHERE (m.team1_id = ? OR m.team2_id = ?)
        AND m.status = 'completed'
        ${season ? "AND se.season = ?" : ""}
      GROUP BY opp.team_id, opp.team_name, opp.team_code
      ORDER BY total_matches DESC
    `;

      const h2hParams = [team.team_name, teamId, teamId, teamId];
      if (season) h2hParams.push(season);

      const [headToHead] = await pool.execute(h2hQuery, h2hParams);

      // Get venue performance
      const venueQuery = `
      SELECT 
        s.stadium_id,
        s.stadium_name,
        s.city,
        COUNT(*) as matches_played,
        SUM(CASE 
          WHEN m.result LIKE CONCAT(?, '%') THEN 1 
          ELSE 0 
        END) as matches_won
      FROM matches m
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      JOIN series se ON m.series_id = se.series_id
      WHERE (m.team1_id = ? OR m.team2_id = ?)
        AND m.status = 'completed'
        ${season ? "AND se.season = ?" : ""}
      GROUP BY s.stadium_id, s.stadium_name, s.city
      ORDER BY matches_played DESC
    `;

      const venueParams = [team.team_name, teamId, teamId];
      if (season) venueParams.push(season);

      const [venueStats] = await pool.execute(venueQuery, venueParams);

      return NextResponse.json({
         success: true,
         data: {
            team,
            statistics: stats,
            head_to_head: headToHead,
            venue_performance: venueStats,
            season: season || "all",
         },
      });
   } catch (error) {
      console.error("Team stats error:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch team statistics" },
         { status: 500 }
      );
   }
}
