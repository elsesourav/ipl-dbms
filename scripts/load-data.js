const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

const createConnection = async () => {
   try {
      const connection = await mysql.createConnection({
         host: process.env.MYSQL_HOST || "localhost",
         user: process.env.MYSQL_USER || "root",
         password: process.env.MYSQL_PASSWORD || "",
         database: "ipl_database",
      });

      console.log("Connected to MySQL server and ipl_database");
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
            // Ignore duplicate entry warnings
            if (!error.message.includes("Duplicate entry")) {
               console.warn(`Warning executing statement: ${error.message}`);
            }
         }
      }
   }
};

const loadSampleData = async () => {
   let connection;

   try {
      connection = await createConnection();
      const fs = require("fs");
      const path = require("path");

      const dataDir = path.join(__dirname, "../data");

      if (!fs.existsSync(dataDir)) {
         console.error(
            "Data directory not found. Please ensure the data files exist."
         );
         process.exit(1);
      }

      console.log("Loading sample data into existing database...");

      // Disable foreign key checks temporarily
      await connection.execute("SET FOREIGN_KEY_CHECKS = 0");

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

      // Re-enable foreign key checks
      await connection.execute("SET FOREIGN_KEY_CHECKS = 1");

      // Update team captains after players are loaded
      console.log("Updating team captains...");
      const captainUpdates = [
         { teamId: 1, captainId: 1 }, // Rohit Sharma for MI
         { teamId: 2, captainId: 8 }, // MS Dhoni for CSK
         { teamId: 3, captainId: 14 }, // Virat Kohli for RCB
         { teamId: 4, captainId: 20 }, // Shreyas Iyer for KKR
         { teamId: 5, captainId: 25 }, // Rishabh Pant for DC
         { teamId: 6, captainId: 30 }, // KL Rahul for PBKS
         { teamId: 7, captainId: 35 }, // Sanju Samson for RR
         { teamId: 8, captainId: 40 }, // Kane Williamson for SRH
         { teamId: 9, captainId: 45 }, // Hardik Pandya for GT
         { teamId: 10, captainId: 50 }, // KL Rahul for LSG
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

      // Display summary
      console.log("\n=== Data Loading Summary ===");
      const tables = [
         "Teams",
         "Stadiums",
         "Series",
         "Umpires",
         "Players",
         "Matches",
         "BattingScorecard",
         "BowlingScorecard",
         "TeamStats",
         "PlayerStats",
         "Users",
      ];

      for (const table of tables) {
         try {
            const [rows] = await connection.execute(
               `SELECT COUNT(*) as count FROM ${table}`
            );
            console.log(`${table}: ${rows[0].count} records`);
         } catch (error) {
            console.log(`${table}: Error counting records`);
         }
      }

      console.log("\nSample data loaded successfully!");
   } catch (error) {
      console.error("Error loading sample data:", error);
      process.exit(1);
   } finally {
      if (connection) {
         await connection.end();
      }
   }
};

loadSampleData();
