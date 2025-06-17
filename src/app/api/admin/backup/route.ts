import { exec } from "child_process";
import fs from "fs";
import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { promisify } from "util";
import pool from "@/lib/db";

const execAsync = promisify(exec);

// POST /api/admin/backup - Initiate database backup
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const {
         backup_type = "full", // 'full', 'data_only', 'schema_only'
         compression = true,
         include_logs = false,
      } = body;

      // Create backup directory if it doesn't exist
      const backupDir = path.join(process.cwd(), "backups");
      if (!fs.existsSync(backupDir)) {
         fs.mkdirSync(backupDir, { recursive: true });
      }

      // Generate backup filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const backupFileName = `ipl_backup_${backup_type}_${timestamp}.sql${
         compression ? ".gz" : ""
      }`;
      const backupPath = path.join(backupDir, backupFileName);

      // Database connection details (should come from environment variables)
      const dbConfig = {
         host: process.env.DB_HOST || "localhost",
         port: process.env.DB_PORT || "3306",
         user: process.env.DB_USER || "root",
         password: process.env.DB_PASSWORD || "",
         database: process.env.DB_NAME || "ipl_database",
      };

      // Build mysqldump command
      let dumpCommand = `mysqldump -h ${dbConfig.host} -P ${dbConfig.port} -u ${dbConfig.user}`;

      if (dbConfig.password) {
         dumpCommand += ` -p${dbConfig.password}`;
      }

      // Add backup type options
      if (backup_type === "schema_only") {
         dumpCommand += " --no-data";
      } else if (backup_type === "data_only") {
         dumpCommand += " --no-create-info";
      }

      // Add additional options
      dumpCommand += " --single-transaction --routines --triggers";

      if (include_logs) {
         dumpCommand += " --flush-logs --lock-tables";
      }

      dumpCommand += ` ${dbConfig.database}`;

      // Add compression if requested
      if (compression) {
         dumpCommand += ` | gzip > "${backupPath}"`;
      } else {
         dumpCommand += ` > "${backupPath}"`;
      }

      // Execute backup
      try {
         const { stdout, stderr } = await execAsync(dumpCommand);

         if (stderr && !stderr.includes("Warning")) {
            throw new Error(`Backup failed: ${stderr}`);
         }

         // Get backup file size
         const stats = fs.statSync(backupPath);
         const backupSize = stats.size;

         // Log backup in database
         const logQuery = `
        INSERT INTO backup_logs (
          backup_type,
          file_name,
          file_path,
          file_size,
          compression_used,
          include_logs,
          status,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, 'completed', CURRENT_TIMESTAMP)
      `;

         await pool.execute(logQuery, [
            backup_type,
            backupFileName,
            backupPath,
            backupSize,
            compression,
            include_logs,
         ]);

         return NextResponse.json({
            success: true,
            message: "Database backup completed successfully",
            data: {
               backup_type,
               file_name: backupFileName,
               file_size: backupSize,
               compression_used: compression,
               created_at: new Date().toISOString(),
            },
         });
      } catch (backupError) {
         // Log failed backup
         const logQuery = `
        INSERT INTO backup_logs (
          backup_type,
          file_name,
          file_path,
          file_size,
          compression_used,
          include_logs,
          status,
          error_message,
          created_at
        ) VALUES (?, ?, ?, 0, ?, ?, 'failed', ?, CURRENT_TIMESTAMP)
      `;

         await pool.execute(logQuery, [
            backup_type,
            backupFileName,
            backupPath,
            compression,
            include_logs,
            (backupError as Error).message,
         ]);

         throw backupError;
      }
   } catch (error) {
      console.error("Error creating database backup:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to create database backup",
            details: (error as Error).message,
         },
         { status: 500 }
      );
   }
}

// GET /api/admin/backup - List available backups
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "20");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status");
      const backup_type = searchParams.get("backup_type");

      let query = `
      SELECT 
        backup_id,
        backup_type,
        file_name,
        file_size,
        compression_used,
        include_logs,
        status,
        error_message,
        created_at
      FROM backup_logs
      WHERE 1=1
    `;

      let queryParams: any[] = [];

      if (status) {
         query += " AND status = ?";
         queryParams.push(status);
      }

      if (backup_type) {
         query += " AND backup_type = ?";
         queryParams.push(backup_type);
      }

      query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
      queryParams.push(limit, offset);

      const [backups] = await pool.execute(query, queryParams);

      // Get total count
      let countQuery = "SELECT COUNT(*) as total FROM backup_logs WHERE 1=1";
      let countParams: any[] = [];

      if (status) {
         countQuery += " AND status = ?";
         countParams.push(status);
      }

      if (backup_type) {
         countQuery += " AND backup_type = ?";
         countParams.push(backup_type);
      }

      const [countResult] = await pool.execute(countQuery, countParams);

      return NextResponse.json({
         success: true,
         data: {
            backups: backups || [],
            pagination: {
               total:
                  Array.isArray(countResult) && countResult.length > 0
                     ? (countResult[0] as any).total
                     : 0,
               limit,
               offset,
            },
         },
      });
   } catch (error) {
      console.error("Error fetching backup list:", error);
      return NextResponse.json(
         { success: false, error: "Failed to fetch backup list" },
         { status: 500 }
      );
   }
}
