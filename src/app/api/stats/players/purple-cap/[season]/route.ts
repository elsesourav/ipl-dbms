import { NextRequest, NextResponse } from "next/server";
import db from "../../../../../../lib/db";

export async function GET(
   request: NextRequest,
   { params }: { params: { season: string } }
) {
   try {
      const season = parseInt(params.season);

      if (isNaN(season)) {
         return NextResponse.json({ error: "Invalid season" }, { status: 400 });
      }

      // Get Purple Cap holder (highest wicket taker)
      const [purpleCapData] = await db.execute(
         `SELECT 
        p.player_id,
        p.name,
        p.jersey_number,
        t.name as team_name,
        t.short_name as team_short,
        t.primary_color,
        COUNT(DISTINCT m.match_id) as matches_played,
        SUM(bs.overs_bowled) as total_overs,
        SUM(bs.runs_conceded) as total_runs_conceded,
        SUM(bs.wickets_taken) as total_wickets,
        SUM(bs.maidens) as total_maidens,
        ROUND(AVG(bs.economy_rate), 2) as average_economy,
        ROUND(SUM(bs.runs_conceded) / NULLIF(SUM(bs.wickets_taken), 0), 2) as bowling_average,
        ROUND(SUM(bs.overs_bowled * 6) / NULLIF(SUM(bs.wickets_taken), 0), 2) as bowling_strike_rate,
        MAX(bs.wickets_taken) as best_figures_wickets,
        MIN(CASE WHEN bs.wickets_taken = MAX(bs.wickets_taken) THEN bs.runs_conceded END) as best_figures_runs
      FROM players p
      JOIN bowling_scorecards bs ON p.player_id = bs.player_id
      JOIN matches m ON bs.match_id = m.match_id
      JOIN teams t ON p.current_team_id = t.team_id
      WHERE m.season_year = ?
      GROUP BY p.player_id, p.name, p.jersey_number, t.name, t.short_name, t.primary_color
      ORDER BY total_wickets DESC, bowling_average ASC
      LIMIT 1`,
         [season]
      );

      if (!(purpleCapData as any[]).length) {
         return NextResponse.json(
            { error: "No bowling data found for this season" },
            { status: 404 }
         );
      }

      const purpleCapHolder = (purpleCapData as any[])[0];

      // Get top 10 wicket takers for context
      const [topBowlers] = await db.execute(
         `SELECT 
        p.player_id,
        p.name,
        t.name as team_name,
        t.short_name as team_short,
        SUM(bs.wickets_taken) as total_wickets,
        COUNT(DISTINCT m.match_id) as matches_played,
        SUM(bs.overs_bowled) as total_overs,
        ROUND(AVG(bs.economy_rate), 2) as average_economy,
        ROUND(SUM(bs.runs_conceded) / NULLIF(SUM(bs.wickets_taken), 0), 2) as bowling_average
      FROM players p
      JOIN bowling_scorecards bs ON p.player_id = bs.player_id
      JOIN matches m ON bs.match_id = m.match_id
      JOIN teams t ON p.current_team_id = t.team_id
      WHERE m.season_year = ?
      GROUP BY p.player_id, p.name, t.name, t.short_name
      ORDER BY total_wickets DESC, bowling_average ASC
      LIMIT 10`,
         [season]
      );

      // Get match-by-match progression for the Purple Cap holder
      const [progression] = await db.execute(
         `SELECT 
        m.match_id,
        m.match_date,
        CONCAT(t1.short_name, ' vs ', t2.short_name) as match_title,
        bs.wickets_taken as wickets_in_match,
        SUM(bs.wickets_taken) OVER (ORDER BY m.match_date, m.match_id) as cumulative_wickets,
        bs.runs_conceded,
        bs.overs_bowled,
        bs.economy_rate
      FROM matches m
      JOIN bowling_scorecards bs ON m.match_id = bs.match_id
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      WHERE bs.player_id = ? AND m.season_year = ?
      ORDER BY m.match_date, m.match_id`,
         [purpleCapHolder.player_id, season]
      );

      // Get best bowling figures of the season
      const [bestFigures] = await db.execute(
         `SELECT 
        p.name as player_name,
        t.short_name as team_short,
        bs.wickets_taken,
        bs.runs_conceded,
        CONCAT(t1.short_name, ' vs ', t2.short_name) as match_title,
        m.match_date
      FROM bowling_scorecards bs
      JOIN players p ON bs.player_id = p.player_id
      JOIN teams t ON p.current_team_id = t.team_id
      JOIN matches m ON bs.match_id = m.match_id
      JOIN teams t1 ON m.team1_id = t1.team_id
      JOIN teams t2 ON m.team2_id = t2.team_id
      WHERE m.season_year = ? AND bs.wickets_taken > 0
      ORDER BY bs.wickets_taken DESC, bs.runs_conceded ASC
      LIMIT 5`,
         [season]
      );

      return NextResponse.json({
         success: true,
         data: {
            season,
            purple_cap_holder: purpleCapHolder,
            top_bowlers: topBowlers,
            progression,
            best_figures: bestFigures,
            race_info: {
               total_matches_played: purpleCapHolder.matches_played,
               wickets_lead:
                  purpleCapHolder.total_wickets -
                  ((topBowlers as any[])[1]?.total_wickets || 0),
               next_challenger: (topBowlers as any[])[1] || null,
            },
         },
      });
   } catch (error) {
      console.error("Error fetching Purple Cap data:", error);
      return NextResponse.json(
         { error: "Internal server error" },
         { status: 500 }
      );
   }
}
