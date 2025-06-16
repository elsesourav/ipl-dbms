import pool from "@/lib/db";

async function testData() {
   try {
      console.log("=== Testing Series Data ===");
      const [series] = await pool.execute(
         "SELECT series_id, series_name, season_year FROM Series ORDER BY season_year DESC"
      );
      console.log("Series:", series);

      console.log("\n=== Testing TeamStats for series_id = 1 ===");
      const [stats1] = await pool.execute(
         "SELECT team_id, matches_played, matches_won, matches_lost, points, net_run_rate FROM TeamStats WHERE series_id = 1 LIMIT 5"
      );
      console.log("TeamStats series 1:", stats1);

      console.log("\n=== Testing TeamStats for series_id = 2 ===");
      const [stats2] = await pool.execute(
         "SELECT team_id, matches_played, matches_won, matches_lost, points, net_run_rate FROM TeamStats WHERE series_id = 2 LIMIT 5"
      );
      console.log("TeamStats series 2:", stats2);

      console.log("\n=== Testing API Query for series_id = 1 ===");
      const [apiResult] = await pool.execute(
         `
         SELECT 
            t.team_id,
            t.team_name,
            t.team_code,
            COALESCE(ts.matches_played, 0) as matches_played,
            COALESCE(ts.matches_won, 0) as matches_won,
            COALESCE(ts.matches_lost, 0) as matches_lost,
            COALESCE(ts.points, 0) as points
         FROM Teams t
         LEFT JOIN TeamStats ts ON t.team_id = ts.team_id AND ts.series_id = ?
         WHERE ts.series_id = ? OR EXISTS (
            SELECT 1 FROM Matches m 
            WHERE (m.team1_id = t.team_id OR m.team2_id = t.team_id) 
            AND m.series_id = ?
         )
         ORDER BY COALESCE(ts.points, 0) DESC
         LIMIT 5
      `,
         [1, 1, 1]
      );
      console.log("API Query Result for series 1:", apiResult);
   } catch (error) {
      console.error("Error:", error);
   }
}

testData();
