import pool from "@/lib/db";

async function testMatchesAPI() {

   try {
      console.log("Testing database connection...");

      // Test basic connection
      const [connection] = await pool.execute("SELECT 1 as test");
      console.log("✅ Database connection successful");

      // Check if teams exist
      const [teams] = await pool.execute("SELECT COUNT(*) as count FROM Teams");
      console.log(`📊 Teams in database: ${teams[0].count}`);

      // Check if matches exist
      const [matches] = await pool.execute(
         "SELECT COUNT(*) as count FROM Matches"
      );
      console.log(`🏏 Matches in database: ${matches[0].count}`);

      // Check completed matches
      const [completedMatches] = await pool.execute(
         "SELECT COUNT(*) as count FROM Matches WHERE is_completed = TRUE"
      );
      console.log(`✅ Completed matches: ${completedMatches[0].count}`); // Test the actual query for team 1
      const teamId = 1;
      const limit = 5;
      const [rows] = await pool.execute(
         `SELECT 
         m.match_id,
         m.match_date,
         m.match_type,
         m.is_completed,
         m.winner_id,
         m.win_type,
         m.win_margin,
         CASE 
            WHEN m.team1_id = ? THEN t2.team_name
            ELSE t1.team_name
         END as opponent,
         CASE 
            WHEN m.winner_id = ? THEN 'Won'
            WHEN m.winner_id IS NULL AND m.is_completed = 1 THEN 'No Result'
            WHEN m.is_completed = 1 THEN 'Lost'
            ELSE 'Upcoming'
         END as result,
         st.stadium_name as venue,
         st.city as venue_city
      FROM Matches m
      LEFT JOIN Teams t1 ON m.team1_id = t1.team_id
      LEFT JOIN Teams t2 ON m.team2_id = t2.team_id
      LEFT JOIN Stadiums st ON m.stadium_id = st.stadium_id
      WHERE (m.team1_id = ? OR m.team2_id = ?) AND m.is_completed = TRUE
      ORDER BY m.match_date DESC
      LIMIT ${limit}`,
         [teamId, teamId, teamId, teamId]
      );

      console.log(`🎯 Found ${rows.length} matches for team ${teamId}:`);
      rows.forEach((match, index) => {
         console.log(
            `  ${index + 1}. vs ${match.opponent} - ${match.result} (${
               match.match_date
            })`
         );
      });
   } catch (error) {
      console.error("❌ Error:", error.message);
      process.exit(1);
   }
}

testMatchesAPI();
