import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDatabase } from "../../../../../lib/db";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with username and password.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful, returns tokens.
 *       401:
 *         description: Invalid credentials.
 *       500:
 *         description: Internal server error.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const { username, password } = await request.json();

    const pool = await connectToDatabase();

    // Fetch user details and active password
    const result = await pool
      .request()
      .input("Username", username)
      .input("Active", true).query(`
        SELECT c.userId, c.username, c.email, p.password1 
        FROM info.client c 
        INNER JOIN info.password p 
        ON c.userId = p.userId 
        WHERE c.username = @Username AND p.active = @Active
      `);

    if (result.recordset.length === 0) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    const user = result.recordset[0];
    const passwordMatch = await bcrypt.compare(password, user.password1);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Generate JWT tokens
    const accessToken = jwt.sign({ userId: user.userId }, JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId: user.userId }, JWT_SECRET, {
      expiresIn: "7d",
    });

    // Set cookies with the tokens
    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      maxAge: 900,
    }); // 15 minutes
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60,
    }); // 7 days

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
