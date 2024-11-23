import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose"; // Importing from jose for JWT handling

// Define constants for JWT secrets (using them directly as strings)
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
 *                 description: Unique username for the user
 *               firstName:
 *                 type: string
 *                 description: User's first name
 *               lastName:
 *                 type: string
 *                 description: User's last name
 *               phoneNumber:
 *                 type: string
 *                 description: User's phone number
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               city:
 *                 type: string
 *                 description: User's city of residence
 *               job:
 *                 type: string
 *                 description: User's job title
 *               password:
 *                 type: string
 *                 description: User's password (8 to 50 characters)
 *             required:
 *               - username
 *               - firstName
 *               - lastName
 *               - phoneNumber
 *               - email
 *               - city
 *               - job
 *               - password
 *     responses:
 *       201:
 *         description: User created successfully and tokens returned
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User registered successfully
 *       400:
 *         description: Invalid input or user already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User already exists
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Internal Server Error
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

    // Generate Access Token using jose
    const accessToken = await new SignJWT({ userId, username, role: "public" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Generate Refresh Token using jose
    const refreshToken = await new SignJWT({ userId, username })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("7d")
      .sign(new TextEncoder().encode(REFRESH_TOKEN_SECRET));

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
