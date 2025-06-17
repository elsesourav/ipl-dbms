import bcrypt from "bcrypt";
import { RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "../../../lib/db";

// GET /api/users - Get all users (admin only)
export async function GET(request: NextRequest) {
   try {
      const { searchParams } = new URL(request.url);
      const role = searchParams.get("role");
      const active = searchParams.get("active");

      let query = `
      SELECT 
        user_id,
        email,
        name,
        role,
        is_active,
        created_at,
        updated_at
      FROM Users
      WHERE 1=1
    `;

      const params: any[] = [];

      if (role) {
         query += " AND role = ?";
         params.push(role);
      }

      if (active === "true") {
         query += " AND is_active = TRUE";
      } else if (active === "false") {
         query += " AND is_active = FALSE";
      }

      query += " ORDER BY created_at DESC";

      const [rows] = await pool.execute<RowDataPacket[]>(query, params);

      return NextResponse.json({
         success: true,
         data: rows,
         count: rows.length,
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch users",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// POST /api/users - Create user (admin only)
export async function POST(request: NextRequest) {
   try {
      const body = await request.json();
      const { email, password, name, role = "viewer" } = body;

      // Validate required fields
      if (!email || !password || !name) {
         return NextResponse.json(
            {
               success: false,
               error: "Missing required fields: email, password, name",
            },
            { status: 400 }
         );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
         return NextResponse.json(
            { success: false, error: "Invalid email format" },
            { status: 400 }
         );
      }

      // Validate role
      const validRoles = ["admin", "scorer", "viewer"];
      if (!validRoles.includes(role)) {
         return NextResponse.json(
            {
               success: false,
               error: "Invalid role. Must be admin, scorer, or viewer",
            },
            { status: 400 }
         );
      }

      // Check if user already exists
      const existingQuery = `SELECT user_id FROM Users WHERE email = ?`;
      const [existing] = await pool.execute<RowDataPacket[]>(existingQuery, [
         email,
      ]);

      if (existing.length > 0) {
         return NextResponse.json(
            { success: false, error: "User with this email already exists" },
            { status: 409 }
         );
      }

      // Hash password
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const insertQuery = `
      INSERT INTO Users (email, password_hash, name, role)
      VALUES (?, ?, ?, ?)
    `;

      const [result] = await pool.execute(insertQuery, [
         email,
         password_hash,
         name,
         role,
      ]);

      const insertResult = result as any;

      // Fetch the created user (without password)
      const selectQuery = `
      SELECT 
        user_id,
        email,
        name,
        role,
        is_active,
        created_at
      FROM Users
      WHERE user_id = ?
    `;

      const [newRecord] = await pool.execute<RowDataPacket[]>(selectQuery, [
         insertResult.insertId,
      ]);

      return NextResponse.json(
         {
            success: true,
            message: "User created successfully",
            data: newRecord[0],
         },
         { status: 201 }
      );
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to create user",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
