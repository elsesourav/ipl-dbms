import dotenv from "dotenv";
import pool from "../src/lib/db.js";

dotenv.config({ path: ".env.local" });

async function clearAllData() {
   try {
      console.log("🔄 Clearing all data from IPL database...");
      console.log("⚠️  This will delete ALL data from the database!");

      // Disable foreign key checks temporarily
      await pool.query("SET FOREIGN_KEY_CHECKS = 0");
      console.log("🔓 Foreign key checks disabled");

      // Get all table names
      const [tables] = await pool.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_TYPE = 'BASE TABLE'
      ORDER BY TABLE_NAME
    `);

      console.log(`📋 Found ${tables.length} tables to clear`);

      // Clear all tables
      for (const table of tables) {
         const tableName = table.TABLE_NAME;
         try {
            await pool.query(`TRUNCATE TABLE \`${tableName}\``);
            console.log(`✅ Cleared table: ${tableName}`);
         } catch (error) {
            console.log(
               `⚠️  Could not truncate ${tableName}, trying DELETE: ${error.message}`
            );
            try {
               await pool.query(`DELETE FROM \`${tableName}\``);
               console.log(`✅ Deleted from table: ${tableName}`);
            } catch (deleteError) {
               console.log(
                  `❌ Failed to clear ${tableName}: ${deleteError.message}`
               );
            }
         }
      }

      // Re-enable foreign key checks
      await pool.query("SET FOREIGN_KEY_CHECKS = 1");
      console.log("🔒 Foreign key checks re-enabled");

      console.log("✅ All data cleared successfully!");
      console.log(
         "💡 You can now run: npm run load-data to load fresh sample data"
      );
   } catch (error) {
      console.error("❌ Failed to clear data:", error.message);
      process.exit(1);
   } finally {
      await pool.end();
   }
}

clearAllData();
