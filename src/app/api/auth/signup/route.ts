import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Define constants for JWT secrets
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";

/**
 * @swagger
 * /api/auth/signup:
 *   post:
 *     summary: Register a new user
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
 *       201:
 *         description: User created successfully and tokens returned
 *       400:
 *         description: Invalid input or user already exists
 *       500:
 *         description: Internal server error
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      username,
      firstName,
      lastName,
      phoneNumber,
      email,
      city,
      job,
      password,
    } = body;

    // Validate required fields
    if (
      !username ||
      !firstName ||
      !lastName ||
      !phoneNumber ||
      !email ||
      !city ||
      !job ||
      !password
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const pool = await connectToDatabase();

    // Check if the username or email already exists
    const existingUser = await pool
      .request()
      .input("Username", username)
      .input("Email", email).query(`
        SELECT * FROM info.client WHERE username = @Username OR email = @Email
      `);

    if (existingUser.recordset.length > 0) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user data into info.client table and get the new userId
    const result = await pool
      .request()
      .input("Username", username)
      .input("FirstName", firstName)
      .input("LastName", lastName)
      .input("PhoneNumber", phoneNumber)
      .input("Email", email)
      .input("City", city)
      .input("Job", job).query(`
        INSERT INTO info.client (username, firstName, lastName, phoneNumber, email, city, job) 
        OUTPUT INSERTED.userId
        VALUES (@Username, @FirstName, @LastName, @PhoneNumber, @Email, @City, @Job)
      `);

    const userId = result.recordset[0].userId;

    // Insert the hashed password into info.password table
    await pool
      .request()
      .input("Password", hashedPassword)
      .input("UserId", userId).query(`
        INSERT INTO info.password (password1, userId, active) 
        VALUES (@Password, @UserId, 1)
      `);

    // Generate JWT tokens
    const accessToken = jwt.sign({ userId, username }, JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId, username }, REFRESH_TOKEN_SECRET, {
      expiresIn: "7d",
    });

    // Set cookies
    const response = NextResponse.json({
      message: "User registered successfully",
    });
    response.cookies.set("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only set secure in production
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });
    response.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Only set secure in production
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during signup:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
