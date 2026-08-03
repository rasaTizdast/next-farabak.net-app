import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export interface AuthUser {
  userId: string;
  username: string;
  role: string;
}

/**
 * Verify a JWT access token string and return the authenticated user.
 * Throws if token is missing, invalid, or expired.
 */
export async function verifyToken(token: string | undefined): Promise<AuthUser> {
  if (!token) {
    throw new Error("No token provided");
  }

  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as AuthUser;
}

/**
 * Extract and verify a JWT from a raw cookie header string.
 * Use this when you have the full "cookie" header value.
 */
export async function verifyTokenFromCookieHeader(
  cookieHeader: string | null
): Promise<AuthUser> {
  if (!cookieHeader) {
    throw new Error("No cookies provided");
  }

  const token = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    throw new Error("No token found in cookies");
  }

  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as AuthUser;
}

/**
 * Require authentication for API routes.
 * Reads the accessToken from cookies, verifies it, and returns the user.
 * Returns a 401 NextResponse if authentication fails.
 *
 * Usage in route handlers:
 *   const auth = await requireAuth();
 *   if (auth instanceof NextResponse) return auth;
 *   // auth.user is the authenticated user
 */
export async function requireAuth(): Promise<AuthUser | NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    return await verifyToken(token);
  } catch {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }
}
