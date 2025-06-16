import pool from "@/lib/db";
require("dotenv").config({ path: ".env.local" });

const createConnection = async () => {
   try {
      const connection = await pool.getConnection();
      console.log("Connected to MySQL server");
      return connection;
   } catch (error) {
      console.error("Error connecting to MySQL:", error);
      throw error;
   }
};

const executeSQLFile = async (connection, filePath) => {
   const fs = require("fs");
   const sqlScript = fs.readFileSync(filePath, "utf8");

   // Split the script into individual statements
   const statements = sqlScript
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

   for (const statement of statements) {
      if (statement.trim()) {
         try {
            await connection.execute(statement);
         } catch (error) {
            // Ignore "database exists" and similar warnings
            if (
               !error.message.includes("already exists") &&
               !error.message.includes("Duplicate entry")
            ) {
               console.warn(`Warning executing statement: ${error.message}`);
            }
         }
      }
   }
};

const initializeDatabase = async () => {
   let connection;

   try {
      connection = await createConnection();
      const fs = require("fs");
      const path = require("path");

      // Check if organized data files exist
      const dataDir = path.join(__dirname, "../data");
      const useOrganizedData = fs.existsSync(dataDir);

      if (useOrganizedData) {
         console.log("Using organized data files...");

         // Execute schema first
         const schemaPath = path.join(dataDir, "00_schema.sql");
         if (fs.existsSync(schemaPath)) {
            console.log("Creating database schema...");
            await executeSQLFile(connection, schemaPath);
         }

         // Execute data files in dependency order
         const dataFiles = [
            "01_teams.sql",
            "02_stadiums.sql",
            "03_series.sql",
            "04_umpires.sql",
            "05_players.sql",
            "06_matches.sql",
            "07_batting_scorecards.sql",
            "08_bowling_scorecards.sql",
            "09_team_stats.sql",
            "10_player_stats.sql",
            "11_users.sql",
         ];

         for (const fileName of dataFiles) {
            const filePath = path.join(dataDir, fileName);
            if (fs.existsSync(filePath)) {
               console.log(`Loading ${fileName}...`);
               await executeSQLFile(connection, filePath);
            } else {
               console.log(`Skipping ${fileName} (file not found)`);
            }
         }

         // Update team captains after players are loaded
         console.log("Updating team captains...");
         const captainUpdates = [
            { teamId: 1, captainId: 1 }, // Rohit Sharma for MI
            { teamId: 2, captainId: 9 }, // MS Dhoni for CSK
            { teamId: 3, captainId: 15 }, // Virat Kohli for RCB
            { teamId: 4, captainId: 20 }, // Shreyas Iyer for KKR
            { teamId: 5, captainId: 26 }, // Rishabh Pant for DC
            { teamId: 6, captainId: 31 }, // KL Rahul for PBKS
            { teamId: 7, captainId: 36 }, // Sanju Samson for RR
            { teamId: 8, captainId: 41 }, // Kane Williamson for SRH
            { teamId: 9, captainId: 46 }, // Hardik Pandya for GT
            { teamId: 10, captainId: 51 }, // KL Rahul for LSG
         ];

         for (const update of captainUpdates) {
            try {
               await connection.execute(
                  "UPDATE Teams SET captain_id = ? WHERE team_id = ?",
                  [update.captainId, update.teamId]
               );
            } catch (error) {
               console.warn(
                  `Warning updating captain for team ${update.teamId}: ${error.message}`
               );
            }
         }
      } else {
         console.log("Using legacy database.sql file...");
         // Fallback to original database.sql
         const sqlScript = fs.readFileSync(
            path.join(__dirname, "../database.sql"),
            "utf8"
         );

         // Split the script into individual statements
         const statements = sqlScript
            .split(";")
            .map((stmt) => stmt.trim())
            .filter((stmt) => stmt.length > 0);

         console.log(`Executing ${statements.length} SQL statements...`);

         for (const statement of statements) {
            if (statement.trim()) {
               try {
                  await connection.execute(statement);
               } catch (error) {
                  // Ignore "database exists" and similar warnings
                  if (!error.message.includes("already exists")) {
                     console.warn(
                        `Warning executing statement: ${error.message}`
                     );
                  }
               }
            }
         }
      }

      console.log("Database initialized successfully!");
      console.log("You can now start the development server with: npm run dev");
   } catch (error) {
      console.error("Error initializing database:", error);
      process.exit(1);
   } finally {
      if (connection) {
         await connection.release();
      }
   }
};

initializeDatabase();
