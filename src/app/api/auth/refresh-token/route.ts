import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * Interface for the decoded token payload.
 * Extends JwtPayload to include userId and username.
 */
interface DecodedToken extends JwtPayload {
  userId: string;
  username: string;
}

const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

/**
 * Function to verify a JWT and return the decoded token.
 *
 * @param {string} token - The JWT token to verify.
 * @param {string} secret - The secret key to verify the token.
 * @returns {Promise<DecodedToken>} - A promise that resolves with the decoded token or rejects with an error.
 */
function verifyToken(token: string, secret: string): Promise<DecodedToken> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err || !decoded) {
        reject(new Error("Invalid or expired refresh token"));
      } else {
        resolve(decoded as DecodedToken);
      }
    });
  });
}

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh the access token using a valid refresh token.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: The refresh token provided during login.
 *     responses:
 *       200:
 *         description: Successfully refreshed the access token.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The new access token.
 *       401:
 *         description: Invalid or expired refresh token.
 *       500:
 *         description: Internal server error.
 */

/**
 * POST handler for refreshing the access token.
 *
 * @param {Request} request - The incoming HTTP request containing the refresh token.
 * @returns {Promise<NextResponse>} - A Next.js response containing the new access token or an error message.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Parse request body to extract the refresh token
    const body = await request.json();
    const refreshToken: string = body.refreshToken;

    // Check if refresh token is provided
    if (!refreshToken) {
      return NextResponse.json(
        { message: "Refresh token is required" },
        { status: 400 }
      );
    }

    // Verify the refresh token and decode it
    let decodedToken: DecodedToken;
    try {
      decodedToken = await verifyToken(refreshToken, REFRESH_TOKEN_SECRET);
    } catch (error) {
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 401 }
      );
    }

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { userId: decodedToken.userId, username: decodedToken.username },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    // Set the new access token in a cookie (if needed, you can include this)
    const response = NextResponse.json({ accessToken: newAccessToken });
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 minutes
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error during token refresh:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
