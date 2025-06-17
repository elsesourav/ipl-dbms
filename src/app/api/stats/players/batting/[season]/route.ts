import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../../lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { season: string } }
) {
   try {
      const season = parseInt(params.season);
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const sortBy = searchParams.get("sort_by") || "runs";
      const teamId = searchParams.get("team_id");

      if (isNaN(season)) {
         return NextResponse.json({ error: "Invalid season" }, { status: 400 });
      }

      let query = `
      SELECT 
        p.player_id,
        p.name,
        p.jersey_number,
        t.name as team_name,
        t.short_name as team_short,
        COUNT(DISTINCT m.match_id) as matches_played,
        COUNT(DISTINCT CASE WHEN bs.is_out = TRUE THEN bs.match_id END) as innings_played,
        SUM(bs.runs_scored) as total_runs,
        COUNT(bs.ball_id) as total_balls,
        SUM(CASE WHEN bs.runs_scored = 4 THEN 1 ELSE 0 END) as total_fours,
        SUM(CASE WHEN bs.runs_scored = 6 THEN 1 ELSE 0 END) as total_sixes,
        MAX(CASE 
          WHEN bs.is_out = TRUE THEN 
            (SELECT SUM(bs2.runs_scored) 
             FROM batting_scorecards bs2 
             WHERE bs2.player_id = bs.player_id 
             AND bs2.match_id = bs.match_id 
             AND bs2.innings_number = bs.innings_number)
          ELSE NULL 
        END) as highest_score,
        ROUND(SUM(bs.runs_scored) / NULLIF(COUNT(DISTINCT CASE WHEN bs.is_out = TRUE THEN bs.match_id END), 0), 2) as batting_average,
        ROUND(SUM(bs.runs_scored) * 100.0 / NULLIF(COUNT(bs.ball_id), 0), 2) as strike_rate,
        COUNT(CASE 
          WHEN (SELECT SUM(bs2.runs_scored) 
                FROM batting_scorecards bs2 
                WHERE bs2.player_id = bs.player_id 
                AND bs2.match_id = bs.match_id 
                AND bs2.innings_number = bs.innings_number) >= 50 
          THEN 1 
        END) as fifties,
        COUNT(CASE 
          WHEN (SELECT SUM(bs2.runs_scored) 
                FROM batting_scorecards bs2 
                WHERE bs2.player_id = bs.player_id 
                AND bs2.match_id = bs.match_id 
                AND bs2.innings_number = bs.innings_number) >= 100 
          THEN 1 
        END) as hundreds
      FROM players p
      JOIN batting_scorecards bs ON p.player_id = bs.player_id
      JOIN matches m ON bs.match_id = m.match_id
      JOIN teams t ON p.current_team_id = t.team_id
      WHERE m.season_year = ?
    `;

      const queryParams: any[] = [season];

      if (teamId) {
         query += ` AND p.current_team_id = ?`;
         queryParams.push(parseInt(teamId));
      }

      query += ` GROUP BY p.player_id, p.name, p.jersey_number, t.name, t.short_name`;

      // Add sorting
      switch (sortBy) {
         case "runs":
            query += ` ORDER BY total_runs DESC`;
            break;
         case "average":
            query += ` HAVING COUNT(DISTINCT CASE WHEN bs.is_out = TRUE THEN bs.match_id END) >= 3 ORDER BY batting_average DESC`;
            break;
         case "strike_rate":
            query += ` HAVING COUNT(bs.ball_id) >= 50 ORDER BY strike_rate DESC`;
            break;
         case "sixes":
            query += ` ORDER BY total_sixes DESC`;
            break;
         case "fours":
            query += ` ORDER BY total_fours DESC`;
            break;
         default:
            query += ` ORDER BY total_runs DESC`;
      }

      query += ` LIMIT ?`;
      queryParams.push(limit);

      const [battingStats] = await db.execute(query, queryParams);

      // Get season summary
      const [summary] = await db.execute(
         `SELECT 
        COUNT(DISTINCT p.player_id) as total_batsmen,
        SUM(bs.runs_scored) as total_runs,
        COUNT(bs.ball_id) as total_balls,
        SUM(CASE WHEN bs.runs_scored = 4 THEN 1 ELSE 0 END) as total_fours,
        SUM(CASE WHEN bs.runs_scored = 6 THEN 1 ELSE 0 END) as total_sixes,
        ROUND(AVG(bs.runs_scored * 100.0 / NULLIF(COUNT(bs.ball_id), 0)), 2) as average_strike_rate
      FROM players p
      JOIN batting_scorecards bs ON p.player_id = bs.player_id
      JOIN matches m ON bs.match_id = m.match_id
      WHERE m.season_year = ?${teamId ? " AND p.current_team_id = ?" : ""}
      GROUP BY p.player_id`,
         teamId ? [season, parseInt(teamId)] : [season]
      );

      return NextResponse.json({
         success: true,
         data: {
            season,
            batting_stats: battingStats,
            summary: (summary as any[])[0],
            sorted_by: sortBy,
         },
      });
   } catch (error) {
      console.error("Error fetching batting statistics:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
