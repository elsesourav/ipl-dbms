// Check database structure and sample data
import pool from "./src/lib/db.js";

async function checkDatabase() {
   try {
      console.log("🔍 Checking database structure...\n");

      // Check if Players table exists and its structure
      console.log("📋 Players table structure:");
      const [playersDesc] = await pool.execute("DESCRIBE Players");
      console.table(playersDesc);

      console.log("\n📊 Sample Players data:");
      const [playersData] = await pool.execute("SELECT * FROM Players LIMIT 3");
      console.table(playersData);

      console.log("\n📊 Players count:");
      const [playersCount] = await pool.execute(
         "SELECT COUNT(*) as count FROM Players"
      );
      console.log("Total players:", playersCount[0].count);

      // Check other tables too
      console.log("\n📋 Teams table structure:");
      const [teamsDesc] = await pool.execute("DESCRIBE Teams");
      console.table(teamsDesc);

      console.log("\n📊 Sample Teams data:");
      const [teamsData] = await pool.execute("SELECT * FROM Teams LIMIT 3");
      console.table(teamsData);

      console.log("\n📋 Matches table structure:");
      const [matchesDesc] = await pool.execute("DESCRIBE Matches");
      console.table(matchesDesc);

      console.log("\n📊 Matches count:");
      const [matchesCount] = await pool.execute(
         "SELECT COUNT(*) as count FROM Matches"
      );
      console.log("Total matches:", matchesCount[0].count);

      // Check PlayerContracts table if it exists
      try {
         console.log("\n📋 PlayerContracts table structure:");
         const [contractsDesc] = await pool.execute("DESCRIBE PlayerContracts");
         console.table(contractsDesc);

         console.log("\n📊 PlayerContracts count:");
         const [contractsCount] = await pool.execute(
            "SELECT COUNT(*) as count FROM PlayerContracts"
         );
         console.log("Total contracts:", contractsCount[0].count);
      } catch (error) {
         console.log(
            "⚠️  PlayerContracts table does not exist:",
            error.message
         );
      }

      console.log("\n✅ Database structure check completed!");
   } catch (error) {
      console.error("❌ Database check failed:", error);
   } finally {
      process.exit(0);
   }
}

checkDatabase();
