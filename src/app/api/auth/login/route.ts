import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma"; // Adjust the import path to your prisma client

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

    // Query the database with Prisma
    const user = await prisma.client.findFirst({
      where: {
        Username: username,
      },
      select: {
        UserID: true,
        Username: true,
        Email: true,
        Role: true,
        Password: {
          where: {
            Active: true,
          },
          select: {
            Password1: true,
          },
        },
      },
    });

    if (!user || !user.Password || user.Password.length === 0) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    const passwordHash = user.Password[0].Password1;
    if (!passwordHash) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(password, passwordHash);

    if (!passwordMatch) {
      return NextResponse.json(
        { message: "Invalid username or password" },
        { status: 401 }
      );
    }

    // Generate access and refresh tokens using jose
    const accessToken = await new SignJWT({
      userId: user.UserID,
      username: user.Username,
      role: user.Role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode(JWT_SECRET));

    const refreshToken = await new SignJWT({
      userId: user.UserID,
      username: user.Username,
      role: user.Role,
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
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
