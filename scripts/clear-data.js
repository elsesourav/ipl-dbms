import pool from "@/lib/db";
require("dotenv").config({ path: ".env.local" });

const createConnection = async () => {
   try {
      const connection = await pool.getConnection();
      return connection;
   } catch (error) {
      console.error("Error connecting to MySQL:", error);
      throw error;
   }
};


const clearAllData = async () => {
   let connection;   

   try {
      connection = await createConnection();

      console.log("Clearing all data from database...");

      // Disable foreign key checks to avoid constraint errors
      await connection.execute("SET FOREIGN_KEY_CHECKS = 0");

      // Clear tables in reverse dependency order
      const tables = [
         "BowlingScorecard",
         "BattingScorecard",
         "PlayerStats",
         "TeamStats",
         "Matches",
         "Players",
         "Users",
         "Umpires",
         "Series",
         "Stadiums",
         "Teams",
      ];

      for (const table of tables) {
         try {
            await connection.execute(`DELETE FROM ${table}`);
            await connection.execute(`ALTER TABLE ${table} AUTO_INCREMENT = 1`);
            console.log(`Cleared ${table}`);
         } catch (error) {
            console.warn(`Warning clearing ${table}: ${error.message}`);
         }
      }

      // Re-enable foreign key checks
      await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

      console.log("All data cleared successfully!");
      console.log("You can now run 'npm run load-data' to reload sample data.");
   } catch (error) {
      console.error("Error clearing data:", error);
      process.exit(1);
   } finally {
      if (connection) {
         await connection.release();
      }
   }
};

clearAllData();
