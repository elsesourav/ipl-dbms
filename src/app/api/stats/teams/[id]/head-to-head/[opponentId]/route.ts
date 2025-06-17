import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../../../lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { id: string; opponentId: string } }
) {
   try {
      const teamId = parseInt(params.id);
      const opponentId = parseInt(params.opponentId);
      const { searchParams } = new URL(request.url);
      const season = searchParams.get("season");

      if (isNaN(teamId) || isNaN(opponentId)) {
         return NextResponse.json(
            { error: "Invalid team IDs" },
            { status: 400 }
         );
      }

      // Get team information
      const [teams] = await db.execute(
         `SELECT team_id, name, short_name, primary_color 
       FROM teams WHERE team_id IN (?, ?)`,
         [teamId, opponentId]
      );

      if ((teams as any[]).length !== 2) {
         return NextResponse.json(
            { error: "One or both teams not found" },
            { status: 404 }
         );
      }

      const team1 = (teams as any[]).find((t: any) => t.team_id === teamId);
      const team2 = (teams as any[]).find((t: any) => t.team_id === opponentId);

      // Build query for head-to-head matches
      let matchQuery = `
      SELECT 
        m.*,
        s.name as stadium_name,
        s.city as stadium_city,
        wt.name as winning_team_name,
        wt.short_name as winning_team_short,
        ts1.total_score as team1_score,
        ts1.wickets_lost as team1_wickets,
        ts1.overs_faced as team1_overs,
        ts2.total_score as team2_score,
        ts2.wickets_lost as team2_wickets,
        ts2.overs_faced as team2_overs
      FROM matches m
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      LEFT JOIN teams wt ON m.winning_team_id = wt.team_id
      LEFT JOIN team_stats ts1 ON m.match_id = ts1.match_id AND m.team1_id = ts1.team_id
      LEFT JOIN team_stats ts2 ON m.match_id = ts2.match_id AND m.team2_id = ts2.team_id
      WHERE ((m.team1_id = ? AND m.team2_id = ?) OR (m.team1_id = ? AND m.team2_id = ?))
    `;

      const queryParams = [teamId, opponentId, opponentId, teamId];

      if (season) {
         matchQuery += ` AND m.season_year = ?`;
         queryParams.push(parseInt(season));
      }

      matchQuery += ` ORDER BY m.match_date DESC`;

      const [matches] = await db.execute(matchQuery, queryParams);

      // Calculate overall head-to-head statistics
      const [overallStats] = await db.execute(
         `SELECT 
        COUNT(*) as total_matches,
        COUNT(CASE WHEN m.winning_team_id = ? THEN 1 END) as team1_wins,
        COUNT(CASE WHEN m.winning_team_id = ? THEN 1 END) as team2_wins,
        COUNT(CASE WHEN m.match_status = 'no_result' THEN 1 END) as no_results,
        AVG(CASE WHEN ts.team_id = ? THEN ts.total_score END) as team1_avg_score,
        AVG(CASE WHEN ts.team_id = ? THEN ts.total_score END) as team2_avg_score,
        MAX(CASE WHEN ts.team_id = ? THEN ts.total_score END) as team1_highest_score,
        MAX(CASE WHEN ts.team_id = ? THEN ts.total_score END) as team2_highest_score
      FROM matches m
      LEFT JOIN team_stats ts ON m.match_id = ts.match_id
      WHERE ((m.team1_id = ? AND m.team2_id = ?) OR (m.team1_id = ? AND m.team2_id = ?))
        ${season ? "AND m.season_year = ?" : ""}`,
         season
            ? [
                 teamId,
                 opponentId,
                 teamId,
                 opponentId,
                 teamId,
                 opponentId,
                 teamId,
                 opponentId,
                 opponentId,
                 teamId,
                 parseInt(season),
              ]
            : [
                 teamId,
                 opponentId,
                 teamId,
                 opponentId,
                 teamId,
                 opponentId,
                 teamId,
                 opponentId,
                 opponentId,
                 teamId,
              ]
      );

      // Get venue-wise head-to-head
      const [venueStats] = await db.execute(
         `SELECT 
        s.stadium_id,
        s.name as stadium_name,
        s.city as stadium_city,
        COUNT(*) as matches_played,
        COUNT(CASE WHEN m.winning_team_id = ? THEN 1 END) as team1_wins,
        COUNT(CASE WHEN m.winning_team_id = ? THEN 1 END) as team2_wins
      FROM matches m
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      WHERE ((m.team1_id = ? AND m.team2_id = ?) OR (m.team1_id = ? AND m.team2_id = ?))
        ${season ? "AND m.season_year = ?" : ""}
      GROUP BY s.stadium_id, s.name, s.city
      ORDER BY matches_played DESC`,
         season
            ? [
                 teamId,
                 opponentId,
                 teamId,
                 opponentId,
                 opponentId,
                 teamId,
                 parseInt(season),
              ]
            : [teamId, opponentId, teamId, opponentId, opponentId, teamId]
      );

      // Get recent form (last 5 matches)
      const [recentForm] = await db.execute(
         `SELECT 
        m.match_id,
        m.match_date,
        m.winning_team_id,
        CASE WHEN m.winning_team_id = ? THEN 'W' WHEN m.winning_team_id = ? THEN 'L' ELSE 'NR' END as result_for_team1
      FROM matches m
      WHERE ((m.team1_id = ? AND m.team2_id = ?) OR (m.team1_id = ? AND m.team2_id = ?))
      ORDER BY m.match_date DESC
      LIMIT 5`,
         [teamId, opponentId, teamId, opponentId, opponentId, teamId]
      );

      // Get top performers in head-to-head
      const [topBatsmen] = await db.execute(
         `SELECT 
        p.name as player_name,
        t.short_name as team_short,
        SUM(bs.runs_scored) as total_runs,
        COUNT(DISTINCT m.match_id) as matches,
        ROUND(AVG(match_runs.runs_per_match), 2) as avg_per_match
      FROM batting_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON bs.match_id = m.match_id
      JOIN (
        SELECT 
          bs2.player_id, 
          bs2.match_id,
          SUM(bs2.runs_scored) as runs_per_match
        FROM batting_scorecards bs2
        GROUP BY bs2.player_id, bs2.match_id
      ) match_runs ON bs.player_id = match_runs.player_id AND bs.match_id = match_runs.match_id
      WHERE ((m.team1_id = ? AND m.team2_id = ?) OR (m.team1_id = ? AND m.team2_id = ?))
        AND (p.current_team_id = ? OR p.current_team_id = ?)
      GROUP BY p.player_id, p.name, t.short_name
      ORDER BY total_runs DESC
      LIMIT 5`,
         [teamId, opponentId, opponentId, teamId, teamId, opponentId]
      );

      return NextResponse.json({
         success: true,
         data: {
            team1,
            team2,
            overall_stats: (overallStats as any[])[0],
            matches,
            venue_stats: venueStats,
            recent_form: recentForm,
            top_performers: {
               batsmen: topBatsmen,
            },
            season_filter: season ? parseInt(season) : null,
         },
      });
   } catch (error) {
      console.error("Error fetching head-to-head stats:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
