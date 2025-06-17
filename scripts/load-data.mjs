import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import pool from "../src/lib/db.js";

dotenv.config({ path: ".env.local" });

async function loadAllData() {
   try {
      console.log("🔄 Loading IPL database with sample data...");

      const dataDir = path.join(process.cwd(), "data");

      if (!fs.existsSync(dataDir)) {
         console.error("❌ Data directory not found:", dataDir);
         process.exit(1);
      }

      // Get all SQL files in dependency order
      const orderedFiles = [
         "insert-teams.sql",
         "insert-players.sql",
         "insert-stadiums.sql",
         "insert-series.sql",
         "insert-umpires.sql",
         "insert-matches.sql",
         "insert-playercontracts.sql",
         "insert-teamsquads.sql",
         "insert-battingscorecard.sql",
         "insert-bowlingscorecard.sql",
         "insert-playerstats.sql",
         "insert-teamstats.sql",
         "insert-users.sql",
         "insert-playerauctionhistory.sql",
         "insert-powerplaydetails.sql",
         "insert-dlsapplications.sql",
         "insert-impactplayersubstitutions.sql",
         "insert-strategytimeouts.sql",
         "insert-superovers.sql",
         "insert-matchinterruptions.sql",
      ];

      // Filter to only include files that actually exist
      const files = orderedFiles.filter((file) =>
         fs.existsSync(path.join(dataDir, file))
      );

      if (files.length === 0) {
         console.log("⚠️  No data files found in the data directory");
         return;
      }

      console.log(`📋 Found ${files.length} data files to load:`);
      files.forEach((file) => console.log(`   - ${file}`));

      // Load each SQL file
      for (const file of files) {
         const filePath = path.join(dataDir, file);
         const sql = fs.readFileSync(filePath, "utf8");
         await executeSQL(sql, `Loading data from ${file}`);
      }

      console.log("✅ All data loaded successfully!");
      console.log("🎯 Your IPL database is ready to use!");
   } catch (error) {
      console.error("❌ Data loading failed:", error.message);
      process.exit(1);
   } finally {
      await pool.end();
   }
}

async function executeSQL(sql, description) {
   console.log(`🔄 ${description}...`);

   // Remove only single-line comments that start at the beginning of a line
   const cleanedSQL = sql
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n")
      .trim();

   if (!cleanedSQL) {
      console.log(`   ⚠️  No executable statements found`);
      return;
   }

   // Split by semicolon
   const statements = cleanedSQL
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

   let processedStatements = 0;

   for (const statement of statements) {
      if (statement.length === 0) continue;

      try {
         await pool.query(statement);
         processedStatements++;
         console.log(`   ✅ Executed: ${statement.substring(0, 60)}...`);
      } catch (error) {
         // Log warning for non-critical errors
         if (
            error.code === "ER_DUP_ENTRY" ||
            error.code === "ER_TABLE_EXISTS_ERROR"
         ) {
            console.log(`   ⚠️  Warning: ${error.message}`);
         } else {
            console.error(`   ❌ Error executing statement: ${error.message}`);
            console.error(`   Statement: ${statement.substring(0, 200)}...`);
            throw error;
         }
      }
   }

   console.log(
      `✅ ${description} completed (${processedStatements} statements processed)`
   );
}

// Run the script
loadAllData();
