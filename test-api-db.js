#!/usr/bin/env node

// Simple test to check database connection and basic query
const mysql = require("mysql2/promise");

async function testConnection() {
   try {
      const pool = mysql.createPool({
         host: process.env.MYSQL_HOST || "localhost",
         user: process.env.MYSQL_USER || "root",
         password: process.env.MYSQL_PASSWORD || "",
         database: process.env.MYSQL_DATABASE || "ipl_database",
         waitForConnections: true,
         connectionLimit: 10,
         queueLimit: 0,
      });

      console.log("🔍 Testing database connection...");
      const [rows] = await pool.execute("SELECT COUNT(*) as count FROM Teams");
      console.log("✅ Database connection successful");
      console.log("📊 Teams count:", rows[0].count);

      // Test the actual query from teams route
      const query = `
      SELECT DISTINCT t.*, 
        CASE WHEN pc.team_id IS NOT NULL THEN true ELSE false END as has_current_players
      FROM Teams t
      LEFT JOIN PlayerContracts pc ON t.team_id = pc.team_id
      ORDER BY t.team_name
    `;

      console.log("🔍 Testing teams query...");
      const [teamRows] = await pool.execute(query);
      console.log("✅ Teams query successful");
      console.log("📊 Teams returned:", teamRows.length);

      if (teamRows.length > 0) {
         console.log("📋 First team:", teamRows[0]);
      }

      await pool.end();
   } catch (error) {
      console.error("❌ Database test failed:", error);
   }
}

testConnection();
