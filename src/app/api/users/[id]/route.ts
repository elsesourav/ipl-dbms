import bcrypt from "bcrypt";
import { ResultSetHeader, RowDataPacket } from "mysql2";
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// GET /api/users/[id] - Get user details
export async function GET(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const userId = parseInt(params.id);

      if (isNaN(userId)) {
         return NextResponse.json(
            { success: false, error: "Invalid user ID" },
            { status: 400 }
         );
      }

      const query = `
      SELECT 
        user_id,
        email,
        name,
        role,
        is_active,
        created_at,
        updated_at
      FROM Users
      WHERE user_id = ?
    `;

      const [rows] = await pool.execute<RowDataPacket[]>(query, [userId]);

      if (rows.length === 0) {
         return NextResponse.json(
            { success: false, error: "User not found" },
            { status: 404 }
         );
      }

      return NextResponse.json({
         success: true,
         data: rows[0],
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to fetch user",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// PUT /api/users/[id] - Update user (admin only)
export async function PUT(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const userId = parseInt(params.id);

      if (isNaN(userId)) {
         return NextResponse.json(
            { success: false, error: "Invalid user ID" },
            { status: 400 }
         );
      }

      const body = await request.json();
      const { email, name, role, is_active, password } = body;

      // Check if user exists
      const checkQuery = "SELECT user_id FROM Users WHERE user_id = ?";
      const [existing] = await pool.execute<RowDataPacket[]>(checkQuery, [
         userId,
      ]);

      if (existing.length === 0) {
         return NextResponse.json(
            { success: false, error: "User not found" },
            { status: 404 }
         );
      }

      // Build update query dynamically
      const updates: string[] = [];
      const values: any[] = [];

      if (email !== undefined) {
         // Check if email is already taken by another user
         const emailCheckQuery =
            "SELECT user_id FROM Users WHERE email = ? AND user_id != ?";
         const [emailExists] = await pool.execute<RowDataPacket[]>(
            emailCheckQuery,
            [email, userId]
         );

         if (emailExists.length > 0) {
            return NextResponse.json(
               { success: false, error: "Email already taken by another user" },
               { status: 409 }
            );
         }

         updates.push("email = ?");
         values.push(email);
      }

      if (name !== undefined) {
         updates.push("name = ?");
         values.push(name);
      }

      if (role !== undefined) {
         const validRoles = ["admin", "scorer", "viewer"];
         if (!validRoles.includes(role)) {
            return NextResponse.json(
               { success: false, error: "Invalid role" },
               { status: 400 }
            );
         }
         updates.push("role = ?");
         values.push(role);
      }

      if (is_active !== undefined) {
         updates.push("is_active = ?");
         values.push(is_active);
      }

      if (password !== undefined && password !== "") {
         const saltRounds = 12;
         const password_hash = await bcrypt.hash(password, saltRounds);
         updates.push("password_hash = ?");
         values.push(password_hash);
      }

      if (updates.length === 0) {
         return NextResponse.json(
            { success: false, error: "No fields to update" },
            { status: 400 }
         );
      }

      values.push(userId);

      const updateQuery = `
      UPDATE Users 
      SET ${updates.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `;

      await pool.execute<ResultSetHeader>(updateQuery, values);

      // Fetch updated user
      const selectQuery = `
      SELECT 
        user_id,
        email,
        name,
        role,
        is_active,
        created_at,
        updated_at
      FROM Users
      WHERE user_id = ?
    `;

      const [updatedUser] = await pool.execute<RowDataPacket[]>(selectQuery, [
         userId,
      ]);

      return NextResponse.json({
         success: true,
         message: "User updated successfully",
         data: updatedUser[0],
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to update user",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}

// DELETE /api/users/[id] - Delete user (admin only)
export async function DELETE(
   request: NextRequest,
   { params }: { params: { id: string } }
) {
   try {
      const userId = parseInt(params.id);

      if (isNaN(userId)) {
         return NextResponse.json(
            { success: false, error: "Invalid user ID" },
            { status: 400 }
         );
      }

      // Check if user exists
      const checkQuery = "SELECT user_id, email FROM Users WHERE user_id = ?";
      const [existing] = await pool.execute<RowDataPacket[]>(checkQuery, [
         userId,
      ]);

      if (existing.length === 0) {
         return NextResponse.json(
            { success: false, error: "User not found" },
            { status: 404 }
         );
      }

      // Instead of hard delete, we can soft delete by setting is_active = FALSE
      const deleteQuery =
         "UPDATE Users SET is_active = FALSE WHERE user_id = ?";
      await pool.execute<ResultSetHeader>(deleteQuery, [userId]);

      return NextResponse.json({
         success: true,
         message: "User deactivated successfully",
         data: { user_id: userId, email: existing[0].email },
      });
   } catch (error) {
      console.error("Database error:", error);
      return NextResponse.json(
         {
            success: false,
            error: "Failed to delete user",
            details: error instanceof Error ? error.message : "Unknown error",
         },
         { status: 500 }
      );
   }
}
