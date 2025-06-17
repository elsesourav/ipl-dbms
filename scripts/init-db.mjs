import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import pool from "../src/lib/db.js";

dotenv.config({ path: ".env.local" });

async function initializeDatabase() {
   try {
      console.log("🔄 Initializing IPL database schema...");

      // First, drop the database if it exists and recreate it
      console.log("🗑️  Dropping existing database...");
      await pool.query("DROP DATABASE IF EXISTS ipl_database");

      console.log("🏗️  Creating fresh database...");
      await pool.query("CREATE DATABASE ipl_database");

      console.log("🔗 Switching to new database...");
      await pool.query("USE ipl_database");

      // Now run the schema file
      const schemaPath = path.join(
         process.cwd(),
         "data",
         "create-database.sql"
      );

      if (!fs.existsSync(schemaPath)) {
         console.error("❌ Schema file not found:", schemaPath);
         process.exit(1);
      }

      const schema = fs.readFileSync(schemaPath, "utf8");
      await executeSQL(
         schema,
         "Creating database schema from create-database.sql"
      );

      console.log("✅ Database schema initialization completed successfully!");
      console.log("📊 You can now load sample data using: npm run load-data");
   } catch (error) {
      console.error("❌ Database initialization failed:", error.message);
      process.exit(1);
   } finally {
      await pool.end();
   }
}

async function executeSQL(sql, description) {
   console.log(`🔄 ${description}...`);

   // Handle multi-line SQL statements more carefully
   // Remove comments and normalize whitespace
   const cleanedSQL = sql
      .replace(/--.*$/gm, "") // Remove single-line comments
      .replace(/\/\*[\s\S]*?\*\//g, "") // Remove multi-line comments
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

   // Split by semicolon but be careful about statements
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
         // Log warning for non-critical errors (like table already exists)
         if (
            error.code === "ER_TABLE_EXISTS_ERROR" ||
            error.code === "ER_DB_CREATE_EXISTS" ||
            error.message.includes("already exists")
         ) {
            console.log(`   ⚠️  ${error.message}`);
            processedStatements++;
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

initializeDatabase();
