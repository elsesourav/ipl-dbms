import pool from "@/lib/db";

const dbConfig = {
   host: process.env.DB_HOST || "localhost",
   user: process.env.DB_USER || "root",
   password: process.env.DB_PASSWORD || "",
   database: process.env.DB_NAME || "ipl_database",
   port: parseInt(process.env.DB_PORT || "3306"),
};

async function testPointsTable() {
   try {

      // Test the points table query for series_id = 1 (IPL 2024)
      const [pointsTable] = await pool.execute(
         `
         SELECT 
            t.team_id,
            t.team_name,
            t.team_code,
            t.team_color,
            COALESCE(ts.matches_played, 0) as matches_played,
            COALESCE(ts.matches_won, 0) as matches_won,
            COALESCE(ts.matches_lost, 0) as matches_lost,
            COALESCE(ts.no_results, 0) as no_results,
            COALESCE(ts.points, 0) as points,
            COALESCE(ts.net_run_rate, 0.00) as net_run_rate
         FROM Teams t
         LEFT JOIN TeamStats ts ON t.team_id = ts.team_id AND ts.series_id = ?
         WHERE EXISTS (
            SELECT 1 FROM TeamStats ts2 
            WHERE ts2.team_id = t.team_id AND ts2.series_id = ?
         )
         ORDER BY ts.points DESC, ts.net_run_rate DESC, t.team_name ASC
      `,
         [1, 1]
      );

      console.log("Points Table for IPL 2024 (series_id = 1):");
      console.log("Raw data:", pointsTable);
      console.log("Pos | Team               | M  | W  | L  | NR | Pts | NRR");
      console.log("----|--------------------|----|----|----|----|-----|------");

      pointsTable.forEach((team, index) => {
         const pos = (index + 1).toString().padEnd(3);
         const name = team.team_name.padEnd(18);
         const m = team.matches_played.toString().padStart(2);
         const w = team.matches_won.toString().padStart(2);
         const l = team.matches_lost.toString().padStart(2);
         const nr = team.no_results.toString().padStart(2);
         const pts = team.points.toString().padStart(3);
         const nrrValue = parseFloat(team.net_run_rate) || 0;
         const nrr =
            nrrValue > 0 ? `+${nrrValue.toFixed(2)}` : nrrValue.toFixed(2);

         console.log(
            `${pos} | ${name} | ${m} | ${w} | ${l} | ${nr} | ${pts} | ${nrr.padStart(
               5
            )}`
         );
      });

   } catch (error) {
      console.error("Error testing points table:", error);
   }
}

testPointsTable();
