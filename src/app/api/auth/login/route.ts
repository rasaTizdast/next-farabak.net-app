import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";

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

    const result = await pool
      .request()
      .input("Username", username)
      .input("Active", true).query(`
        SELECT c.userId, c.username, c.email, c.role, p.password1 
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

    // Generate access and refresh tokens using jose
    const accessToken = await new SignJWT({
      userId: user.userId,
      username: user.username,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode(JWT_SECRET));

    const refreshToken = await new SignJWT({
      userId: user.userId,
      username: user.username,
      role: user.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(REFRESH_TOKEN_SECRET));

    const response = NextResponse.json({ message: "Login successful" });
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60,
      path: "/",
    });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
