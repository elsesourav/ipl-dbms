const mysql = require("mysql2/promise");
require("dotenv").config({ path: ".env.local" });

const createConnection = async () => {
   try {
      const connection = await mysql.createConnection({
         host: process.env.MYSQL_HOST || "localhost",
         user: process.env.MYSQL_USER || "root",
         password: process.env.MYSQL_PASSWORD || "",
      });

      console.log("Connected to MySQL server");
      return connection;
   } catch (error) {
      console.error("Error connecting to MySQL:", error);
      throw error;
   }
};

const initializeDatabase = async () => {
   let connection;

   try {
      connection = await createConnection();

      // Read and execute the SQL file
      const fs = require("fs");
      const path = require("path");
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
                  console.warn(`Warning executing statement: ${error.message}`);
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
         await connection.end();
      }
   }
};

initializeDatabase();
