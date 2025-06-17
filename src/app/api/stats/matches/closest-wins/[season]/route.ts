import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../../lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { season: string } }
) {
   try {
      const season = parseInt(params.season);
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "10");

      if (isNaN(season)) {
         return NextResponse.json({ error: "Invalid season" }, { status: 400 });
      }

      // Get closest wins by runs
      const [closestWinsByRuns] = await db.execute(
         `SELECT 
        m.match_id,
        m.match_number,
        m.match_date,
        t1.name as team1_name, t1.short_name as team1_short,
        t2.name as team2_name, t2.short_name as team2_short,
        tw.name as winning_team_name, tw.short_name as winning_team_short,
        s.name as stadium_name, s.city as stadium_city,
        m.result_type,
        m.win_margin,
        'runs' as margin_type,
        CASE 
          WHEN m.team1_id = m.winning_team_id THEN ts1.total_score
          ELSE ts2.total_score
        END as winning_score,
        CASE 
          WHEN m.team1_id = m.winning_team_id THEN ts2.total_score
          ELSE ts1.total_score
        END as losing_score
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN teams tw ON m.winning_team_id = tw.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      LEFT JOIN team_stats ts1 ON m.match_id = ts1.match_id AND m.team1_id = ts1.team_id
      LEFT JOIN team_stats ts2 ON m.match_id = ts2.match_id AND m.team2_id = ts2.team_id
      WHERE m.season_year = ? 
        AND m.match_status = 'completed'
        AND m.result_type = 'runs'
        AND m.win_margin <= 20
      ORDER BY m.win_margin ASC, m.match_date DESC
      LIMIT ?`,
         [season, Math.ceil(limit / 2)]
      );

      // Get closest wins by balls
      const [closestWinsByBalls] = await db.execute(
         `SELECT 
        m.match_id,
        m.match_number,
        m.match_date,
        t1.name as team1_name, t1.short_name as team1_short,
        t2.name as team2_name, t2.short_name as team2_short,
        tw.name as winning_team_name, tw.short_name as winning_team_short,
        s.name as stadium_name, s.city as stadium_city,
        m.result_type,
        m.win_margin,
        'balls' as margin_type,
        CASE 
          WHEN m.team1_id = m.winning_team_id THEN ts1.total_score
          ELSE ts2.total_score
        END as winning_score,
        CASE 
          WHEN m.team1_id = m.winning_team_id THEN ts2.total_score
          ELSE ts1.total_score
        END as losing_score
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN teams tw ON m.winning_team_id = tw.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      LEFT JOIN team_stats ts1 ON m.match_id = ts1.match_id AND m.team1_id = ts1.team_id
      LEFT JOIN team_stats ts2 ON m.match_id = ts2.match_id AND m.team2_id = ts2.team_id
      WHERE m.season_year = ? 
        AND m.match_status = 'completed'
        AND m.result_type = 'wickets'
        AND m.win_margin <= 12
      ORDER BY m.win_margin ASC, m.match_date DESC
      LIMIT ?`,
         [season, Math.ceil(limit / 2)]
      );

      // Combine and sort all closest wins
      const allClosestWins = [
         ...(closestWinsByRuns as any[]).map((match) => ({
            ...match,
            closeness_score: match.win_margin, // Lower is closer for runs
         })),
         ...(closestWinsByBalls as any[]).map((match) => ({
            ...match,
            closeness_score: 24 - match.win_margin, // Convert balls remaining to closeness score
         })),
      ]
         .sort((a, b) => {
            if (a.margin_type === "runs" && b.margin_type === "runs") {
               return a.win_margin - b.win_margin;
            }
            if (a.margin_type === "balls" && b.margin_type === "balls") {
               return a.win_margin - b.win_margin;
            }
            if (a.margin_type === "runs" && b.margin_type === "balls") {
               return a.win_margin <= 5 ? -1 : 1; // Very close run wins are closer than ball wins
            }
            if (a.margin_type === "balls" && b.margin_type === "runs") {
               return b.win_margin <= 5 ? 1 : -1;
            }
            return 0;
         })
         .slice(0, limit);

      // Get Super Over matches (ultimate close matches)
      const [superOverMatches] = await db.execute(
         `SELECT 
        m.match_id,
        m.match_number,
        m.match_date,
        t1.name as team1_name, t1.short_name as team1_short,
        t2.name as team2_name, t2.short_name as team2_short,
        tw.name as winning_team_name, tw.short_name as winning_team_short,
        s.name as stadium_name, s.city as stadium_city,
        so.team1_score as super_over_team1_score,
        so.team2_score as super_over_team2_score,
        'super_over' as margin_type
      FROM matches m
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      JOIN teams tw ON m.winning_team_id = tw.team_id
      JOIN stadiums s ON m.stadium_id = s.stadium_id
      JOIN super_overs so ON m.match_id = so.match_id
      WHERE m.season_year = ? AND m.match_status = 'completed'
      ORDER BY m.match_date DESC`,
         [season]
      );

      // Get season statistics
      const [seasonStats] = await db.execute(
         `SELECT 
        COUNT(*) as total_matches,
        COUNT(CASE WHEN result_type = 'runs' AND win_margin <= 10 THEN 1 END) as close_wins_by_runs,
        COUNT(CASE WHEN result_type = 'wickets' AND win_margin <= 6 THEN 1 END) as close_wins_by_balls,
        COUNT(CASE WHEN match_id IN (SELECT match_id FROM super_overs) THEN 1 END) as super_over_matches,
        MIN(CASE WHEN result_type = 'runs' THEN win_margin END) as closest_win_by_runs,
        MIN(CASE WHEN result_type = 'wickets' THEN win_margin END) as closest_win_by_balls
      FROM matches
      WHERE season_year = ? AND match_status = 'completed'`,
         [season]
      );

      return NextResponse.json({
         success: true,
         data: {
            season,
            closest_wins: allClosestWins,
            super_over_matches: superOverMatches,
            season_stats: (seasonStats as any[])[0],
         },
      });
   } catch (error) {
      console.error("Error fetching closest wins:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
