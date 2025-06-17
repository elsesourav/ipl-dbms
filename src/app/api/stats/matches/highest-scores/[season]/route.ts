import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../../lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { season: string } }
) {
   try {
      const season = parseInt(params.season);
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "20");
      const teamId = searchParams.get("team_id");

      if (isNaN(season)) {
         return NextResponse.json({ error: "Invalid season" }, { status: 400 });
      }

      let query = `
      SELECT 
        ts.*,
        m.match_id,
        m.match_number,
        m.match_date,
        t.name as team_name,
        t.short_name as team_short,
        t.primary_color,
        opp.name as opponent_name,
        opp.short_name as opponent_short,
        s.name as stadium_name,
        s.city as stadium_city,
        CASE WHEN ts.team_id = m.team1_id THEN 'team1' ELSE 'team2' END as batting_order,
        ts.total_score,
        ts.wickets_lost,
        ts.overs_faced,
        ROUND(ts.total_score / ts.overs_faced, 2) as run_rate
      FROM team_stats ts
      JOIN matches m ON ts.match_id = m.match_id
      JOIN teams t ON ts.team_id = t.team_id
      JOIN teams opp ON (CASE WHEN ts.team_id = m.team1_id THEN m.team2_id ELSE m.team1_id END) = opp.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      WHERE m.season_year = ? AND m.match_status = 'completed'
    `;

      const queryParams: any[] = [season];

      if (teamId) {
         query += ` AND ts.team_id = ?`;
         queryParams.push(parseInt(teamId));
      }

      query += ` ORDER BY ts.total_score DESC LIMIT ?`;
      queryParams.push(limit);

      const [highestScores] = await db.execute(query, queryParams);

      // Get highest individual scores in those matches
      const [individualScores] = await db.execute(
         `SELECT 
        p.name as player_name,
        p.jersey_number,
        t.short_name as team_short,
        m.match_id,
        SUM(bs.runs_scored) as individual_score,
        COUNT(bs.ball_id) as balls_faced,
        SUM(CASE WHEN bs.runs_scored = 4 THEN 1 ELSE 0 END) as fours,
        SUM(CASE WHEN bs.runs_scored = 6 THEN 1 ELSE 0 END) as sixes,
        ROUND(SUM(bs.runs_scored) * 100.0 / COUNT(bs.ball_id), 2) as strike_rate
      FROM batting_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON bs.match_id = m.match_id
      WHERE m.season_year = ? AND m.match_status = 'completed'
      GROUP BY bs.player_id, bs.match_id, bs.innings_number, p.name, p.jersey_number, t.short_name, m.match_id
      HAVING individual_score >= 50
      ORDER BY individual_score DESC
      LIMIT 10`,
         [season]
      );

      // Get season statistics
      const [seasonStats] = await db.execute(
         `SELECT 
        COUNT(DISTINCT m.match_id) as total_matches,
        AVG(ts.total_score) as average_score,
        MAX(ts.total_score) as highest_team_score,
        MIN(ts.total_score) as lowest_team_score,
        COUNT(CASE WHEN ts.total_score >= 200 THEN 1 END) as scores_200_plus,
        COUNT(CASE WHEN ts.total_score >= 180 THEN 1 END) as scores_180_plus,
        SUM(ts.total_score) as total_runs,
        SUM(ts.wickets_lost) as total_wickets
      FROM team_stats ts
      JOIN matches m ON ts.match_id = m.match_id
      WHERE m.season_year = ? AND m.match_status = 'completed'${
         teamId ? " AND ts.team_id = ?" : ""
      }`,
         teamId ? [season, parseInt(teamId)] : [season]
      );

      // Get highest partnerships
      const [partnerships] = await db.execute(
         `SELECT 
        p1.name as batsman1_name,
        p2.name as batsman2_name,
        t.short_name as team_short,
        m.match_id,
        m.match_date,
        partnership.runs as partnership_runs,
        partnership.balls as partnership_balls,
        partnership.wicket_number
      FROM partnerships partnership
      JOIN players p1 ON partnership.batsman1_id = p1.player_id
      JOIN players p2 ON partnership.batsman2_id = p2.player_id
      JOIN teams t ON partnership.team_id = t.team_id
      JOIN matches m ON partnership.match_id = m.match_id
      WHERE m.season_year = ?
      ORDER BY partnership.runs DESC
      LIMIT 10`,
         [season]
      );

      return NextResponse.json({
         success: true,
         data: {
            season,
            highest_team_scores: highestScores,
            highest_individual_scores: individualScores,
            highest_partnerships: partnerships,
            season_stats: (seasonStats as any[])[0],
         },
      });
   } catch (error) {
      console.error("Error fetching highest scores:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
