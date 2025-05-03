import { NextResponse } from "next/server";
import { jwtVerify, SignJWT } from "jose"; // Using jose for JWT handling

/**
 * Interface for the decoded token payload.
 */
interface DecodedToken {
  userId: string;
  username: string;
  role: string;
}

const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_refresh_token_secret";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Token expiration times (in seconds)
const ACCESS_TOKEN_EXPIRATION = 15 * 60; // 15 minutes

/**
 * Verifies a JWT using jose and returns the decoded payload.
 *
 * @param {string} token - The JWT token to verify.
 * @param {Uint8Array} secret - The secret key to verify the token.
 * @returns {Promise<DecodedToken>} - A promise that resolves with the decoded token or rejects with an error.
 */
async function verifyToken(
  token: string,
  secret: Uint8Array
): Promise<DecodedToken> {
  try {
    const { payload } = await jwtVerify(token, secret);

    // Ensure the required fields exist in the payload
    if (
      typeof payload.userId === "string" &&
      typeof payload.username === "string" &&
      typeof payload.role === "string"
    ) {
      return payload as unknown as DecodedToken;
    } else {
      throw new Error("محتوای توکن نامعتبر است: فیلدهای ضروری وجود ندارند");
    }
  } catch (err: unknown) {
    // Ensure 'err' is of type 'Error' before accessing 'message'
    if (err instanceof Error) {
      throw new Error("توکن بازیابی نامعتبر یا منقضی شده است: " + err.message);
    } else {
      // Handle unexpected error types
      throw new Error("توکن بازیابی نامعتبر یا منقضی شده است: خطای ناشناخته");
    }
  }
}

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh the access token using a refresh token
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
 *                 description: The refresh token used to generate a new access token
 *             required:
 *               - refreshToken
 *     responses:
 *       200:
 *         description: Successfully generated a new access token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 accessToken:
 *                   type: string
 *                   description: The new access token
 *       400:
 *         description: Bad request, refresh token missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: توکن بازیابی الزامی است
 *       401:
 *         description: Unauthorized, invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: توکن بازیابی نامعتبر یا منقضی شده است
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: خطای داخلی سرور
 */

/**
 * POST handler for refreshing the access token.
 *
 * @param {Request} request - The incoming HTTP request containing the refresh token.
 * @returns {Promise<NextResponse>} - A Next.js response containing the new access token or an error message.
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Try to get refresh token from request body first
    let refreshToken: string | undefined;

    try {
      const body = await request.json();
      refreshToken = body.refreshToken;
    } catch (e) {
      // If request body parsing fails, check for refresh token in cookies
      const cookies = request.headers.get("cookie");
      if (cookies) {
        const cookieObj = Object.fromEntries(
          cookies.split("; ").map((c) => {
            const [name, ...value] = c.split("=");
            return [name, value.join("=")];
          })
        );
        refreshToken = cookieObj.refreshToken;
      }
    }

    if (!refreshToken) {
      return NextResponse.json(
        { message: "توکن بازیابی الزامی است" },
        { status: 400 }
      );
    }

    // Decode the refresh token using jose
    let decodedToken: DecodedToken;
    try {
      decodedToken = await verifyToken(
        refreshToken,
        new TextEncoder().encode(REFRESH_TOKEN_SECRET)
      );
    } catch (error) {
      return NextResponse.json(
        { message: (error as Error).message },
        { status: 401 }
      );
    }

    // Generate a new access token
    const newAccessToken = await new SignJWT({
      userId: decodedToken.userId,
      username: decodedToken.username,
      role: decodedToken.role,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("15m")
      .sign(new TextEncoder().encode(JWT_SECRET));

    // Set the new access token as an HTTP-only cookie
    const response = NextResponse.json({
      accessToken: newAccessToken,
      success: true,
      user: {
        userId: decodedToken.userId,
        username: decodedToken.username,
        role: decodedToken.role,
      },
    });

    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: ACCESS_TOKEN_EXPIRATION,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("خطا در بازیابی توکن:", error);
    return NextResponse.json(
      { message: "خطای داخلی سرور", success: false },
      { status: 500 }
    );
  }
}
