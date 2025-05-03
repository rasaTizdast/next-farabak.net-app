import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Log out a user and clear the refresh token cookie.
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Successfully logged out.
 *       500:
 *         description: Internal server error.
 */

/**
 * POST handler for logging out a user.
 *
 * @returns {Promise<NextResponse>} - A Next.js response indicating the logout status.
 */
export async function POST(): Promise<NextResponse> {
  try {
    // Create a response object
    const response = NextResponse.json({ message: "با موفقیت خارج شدید" });

    // Clear the refresh token cookie
    response.cookies.set("refreshToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0), // Setting to a past date to invalidate the cookie
    });

    // Clear the accesss token cookie
    response.cookies.set("accessToken", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(0), // Setting to a past date to invalidate the cookie
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
  }
}
