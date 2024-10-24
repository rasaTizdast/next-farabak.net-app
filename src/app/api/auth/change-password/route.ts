import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { connectToDatabase } from "../../../../../lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const SALT_ROUNDS = 10;

/**
 * @swagger
 * /api/auth/change-password:
 *   patch:
 *     summary: Change the user's password.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The current password for validation.
 *               newPassword:
 *                 type: string
 *                 description: The new password to set.
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *       401:
 *         description: Unauthorized or invalid current password.
 *       500:
 *         description: Internal server error.
 */
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 }
      );
    }

    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );

    const { userId } = payload as { userId: string };
    const { currentPassword, newPassword } = await request.json();

    const pool = await connectToDatabase();

    // Fetch the user's current active password
    const result = await pool
      .request()
      .input("UserId", userId)
      .input("Active", true)
      .query(
        "SELECT password1 FROM info.password WHERE userId = @UserId AND active = @Active"
      );

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { message: "Current password not found" },
        { status: 401 }
      );
    }

    const currentHashedPassword = result.recordset[0].password1;

    // Check if the provided current password is correct
    const passwordMatch = await bcrypt.compare(
      currentPassword,
      currentHashedPassword
    );
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid current password" },
        { status: 401 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Deactivate old passwords
    await pool
      .request()
      .input("UserId", userId)
      .input("Active", false)
      .query(
        "UPDATE info.password SET active = @Active WHERE userId = @UserId"
      );

    // Insert new password
    await pool
      .request()
      .input("UserId", userId)
      .input("Password", hashedNewPassword)
      .input("Active", true).query(`
        INSERT INTO info.password (userId, password1, active) 
        VALUES (@UserId, @Password, @Active)
      `);

    return NextResponse.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
