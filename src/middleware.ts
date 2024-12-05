import { NextResponse, NextRequest } from "next/server";
import { jwtVerify, SignJWT } from "jose";

// Define your JWT secrets (ensure they're stored securely)
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const REFRESH_TOKEN_SECRET =
  process.env.REFRESH_TOKEN_SECRET || "your_refresh_jwt_secret";

// Token expiration times (in seconds)
const ACCESS_TOKEN_EXPIRATION = 15 * 60; // 15 minutes

interface ExtendedNextRequest extends NextRequest {
  user?: { userId: string; username: string; role: string };
}

// Helper function to create a new access token
const createAccessToken = async (user: {
  userId: string;
  username: string;
  role: string;
}) => {
  const expirationTimeInSeconds =
    Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRATION;

  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expirationTimeInSeconds)
    .sign(new TextEncoder().encode(JWT_SECRET));
};

// Middleware function to protect routes and handle token refresh
export async function middleware(req: ExtendedNextRequest) {
  console.log("Middleware execution started...");

  // Extract tokens from cookies
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  console.log("Access token from cookies:", accessToken);
  console.log("Refresh token from cookies:", refreshToken);

  // Define protected routes
  const protectedRoutes = ["/dashboard", "/admin"];

  // Check if the request is for a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );
  console.log("Is protected route:", isProtectedRoute);

  // If the user is trying to access a protected route without any token, redirect to login
  if (isProtectedRoute && !accessToken && !refreshToken) {
    console.log("No tokens found, redirecting to login...");
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // If the access token is missing but refresh token is available, refresh the access token
  if (!accessToken && refreshToken) {
    console.log("No access token found, attempting to refresh...");

    try {
      // Verify the refresh token
      const { payload: refreshPayload } = await jwtVerify(
        refreshToken,
        new TextEncoder().encode(REFRESH_TOKEN_SECRET)
      );

      const user = refreshPayload as {
        userId: string;
        username: string;
        role: string;
      };

      console.log("Refresh token verified, creating new access token...");

      // Create a new access token
      const newAccessToken = await createAccessToken(user);

      console.log("New access token created:", newAccessToken);

      // Add the new access token to the cookies
      const response = NextResponse.next();
      response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        path: "/",
        maxAge: ACCESS_TOKEN_EXPIRATION,
      });

      console.log("New access token set in cookies");

      // Check if the user was navigating to an auth route, if so, redirect to the dashboard
      if (req.nextUrl.pathname.startsWith("/auth")) {
        console.log(
          "User tried to access auth route after refresh, redirecting to dashboard..."
        );
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      return response; // Proceed to the route
    } catch (error) {
      console.error("Refresh token verification error:", error);
      return NextResponse.redirect(new URL("/auth/login", req.url)); // Redirect to login if refresh token is invalid
    }
  }

  // If there's an access token, verify it
  if (accessToken) {
    try {
      // Verify the access token using jose
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(JWT_SECRET)
      );

      const user = payload as {
        userId: string;
        username: string;
        role: string;
      };

      console.log("Access token verified:", user);

      // Attach user information to the request for later use in API routes
      req.user = user;

      // Role-based access control
      if (
        req.nextUrl.pathname.startsWith("/admin") &&
        user.role.toLowerCase() !== "admin"
      ) {
        console.log("Non-admin user trying to access admin panel");
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      // If a logged-in user tries to access auth routes, redirect to the dashboard
      if (req.nextUrl.pathname.startsWith("/auth") && user) {
        console.log(
          "Logged-in user trying to access auth routes, redirecting to dashboard"
        );
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      return NextResponse.next(); // Proceed to the requested route if all checks pass
    } catch (error) {
      console.error("Access token verification error:", error);
    }
  }

  console.log("No access token needed, proceeding to next middleware or route");

  // Proceed if no token is needed and no refresh process is triggered
  return NextResponse.next();
}

// Specify the routes where this middleware should be applied
export const config = {
  matcher: [
    "/dashboard/:path*", // Protect all subroutes of /dashboard
    "/admin/:path*", // Protect all subroutes of /admin-panel
    "/auth/:path*", // Protect all auth routes
    // "/:path*",
  ],
};
