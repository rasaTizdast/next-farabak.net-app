import { jwtVerify, SignJWT } from "jose";
import { NextResponse, NextRequest } from "next/server";

import { verifyToken } from "@/lib/auth";
import { negotiate } from "@/lib/contentNegotiation";
import { parsePositivePageNumber } from "@/lib/pagination";

// Define your JWT secrets (ensure they're stored securely)
const JWT_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}
if (!REFRESH_TOKEN_SECRET) {
  throw new Error("Missing REFRESH_TOKEN_SECRET environment variable");
}

// Token expiration times (in seconds)
const ACCESS_TOKEN_EXPIRATION = 15 * 60; // 15 minutes

// Pass-through response for HTML requests; declares Accept so caches
// never serve a cached HTML variant to an agent asking for markdown.
function htmlResponse() {
  const response = NextResponse.next();
  response.headers.append("Vary", "Accept");
  return response;
}

type ProductPageCheck =
  | { type: "all"; page: number }
  | { type: "category"; category: string; page: number }
  | { type: "subcategory"; subcategory: string; page: number }
  | "not-found"
  | null;

function getProductPageCheck(req: NextRequest): ProductPageCheck {
  const pathname = req.nextUrl.pathname;
  const segments = pathname.split("/").filter(Boolean);

  if (pathname === "/products") {
    const pageValues = req.nextUrl.searchParams.getAll("page");
    if (pageValues.length === 0) return null;
    if (pageValues.length !== 1) return "not-found";
    const page = parsePositivePageNumber(pageValues[0]);
    return page === null ? "not-found" : { type: "all", page };
  }

  if (segments[0] !== "products") return null;

  if (segments.length === 3 && segments[1] === "page") {
    const page = parsePositivePageNumber(segments[2]);
    return page === null ? "not-found" : { type: "all", page };
  }

  if (segments.length === 2 && segments[1] !== "search") {
    return { type: "category", category: segments[1], page: 1 };
  }

  if (segments.length === 3 && segments[1] !== "page") {
    return { type: "subcategory", subcategory: segments[2], page: 1 };
  }

  if (segments.length === 4 && segments[2] === "page") {
    const page = parsePositivePageNumber(segments[3]);
    return page === null ? "not-found" : { type: "category", category: segments[1], page };
  }

  if (segments.length === 5 && segments[3] === "page") {
    const page = parsePositivePageNumber(segments[4]);
    return page === null ? "not-found" : { type: "subcategory", subcategory: segments[2], page };
  }

  return null;
}

async function hasProductPageData(check: Exclude<ProductPageCheck, "not-found" | null>) {
  const { hasProductListingPage } = await import("@/lib/data/product-page-validation");
  return hasProductListingPage(check);
}

export function notFoundResponse(method: string) {
  const body =
    method === "HEAD"
      ? null
      : `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, follow">
  <title>صفحه پیدا نشد | فرابک</title>
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; min-height: 100vh; background: #f7f9fc; color: #061a30; font-family: system-ui, sans-serif; }
    header { padding: 1.25rem max(1.5rem, calc((100vw - 1100px) / 2)); border-bottom: 1px solid #dce5ef; background: #fff; }
    header a { color: #061a30; font-size: 1.25rem; font-weight: 800; text-decoration: none; }
    main { display: flex; min-height: calc(100vh - 78px); flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 3rem 1.5rem; text-align: center; }
    img { display: block; width: min(100%, 700px); height: auto; }
    h1 { margin: 0; font-size: clamp(1.5rem, 3vw, 2rem); }
    p { margin: 0; line-height: 1.9; color: #526579; }
    nav { display: flex; flex-wrap: wrap; justify-content: center; gap: .75rem; margin-top: .5rem; }
    nav a { min-height: 44px; display: inline-flex; align-items: center; padding: .65rem 1.25rem; border-radius: .5rem; border: 1px solid #1265e8; color: #1265e8; font-weight: 700; text-decoration: none; }
    nav a:first-child { background: #1265e8; color: #fff; }
    a:focus-visible { outline: 3px solid #1265e8; outline-offset: 3px; }
  </style>
</head>
<body>
  <header><a href="/">فرابک</a></header>
  <main>
    <img src="/404.png" width="1366" height="666" alt="">
    <h1>صفحه پیدا نشد</h1>
    <p>صفحه مورد نظر در فهرست محصولات پیدا نشد.</p>
    <nav aria-label="مسیرهای پیشنهادی"><a href="/products">مشاهده محصولات</a><a href="/contact-us">ارتباط با ما</a></nav>
  </main>
</body>
</html>`;

  return new NextResponse(body, {
    status: 404,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Robots-Tag": "noindex",
      Vary: "Accept",
    },
  });
}

interface ExtendedNextRequest extends NextRequest {
  user?: { userId: string; username: string; role: string };
}

// Helper function to create a new access token
const createAccessToken = async (user: { userId: string; username: string; role: string }) => {
  const expirationTimeInSeconds = Math.floor(Date.now() / 1000) + ACCESS_TOKEN_EXPIRATION;

  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expirationTimeInSeconds)
    .sign(new TextEncoder().encode(JWT_SECRET));
};

// Helper function to refresh access token
const refreshAccessToken = async (refreshToken: string) => {
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

    // Create a new access token
    return await createAccessToken(user);
  } catch (error) {
    console.error("Failed to refresh token:", error);
    throw error;
  }
};

// Middleware function to protect routes and handle token refresh
export async function proxy(req: ExtendedNextRequest) {
  const pathname = req.nextUrl.pathname;
  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  const isDocumentRequest = req.headers.get("RSC") !== "1";
  if (isDocumentRequest && (req.method === "GET" || req.method === "HEAD")) {
    const productPageCheck = getProductPageCheck(req);
    if (productPageCheck === "not-found") return notFoundResponse(req.method);

    if (productPageCheck) {
      try {
        if (!(await hasProductPageData(productPageCheck))) return notFoundResponse(req.method);
      } catch {
        console.error("Product page validation failed before rendering.");
      }
    }
  }

  // Content negotiation for AI agents (acceptmarkdown.com):
  // serve text/markdown when the client prefers it, and always declare
  // Vary: Accept so caches never mix HTML and markdown variants.
  const isPageRequest =
    !pathname.startsWith("/api") &&
    !pathname.startsWith("/_next") &&
    !pathname.startsWith("/markdown") &&
    !pathname.includes(".");

  if (isPageRequest && !isProtectedRoute) {
    const negotiated = negotiate(req.headers.get("accept"));

    if (negotiated === null) {
      // Accept header lists only types we cannot produce -> 406 per RFC 9110
      return new NextResponse("Not Acceptable", {
        status: 406,
        headers: { "Content-Type": "text/plain; charset=utf-8", Vary: "Accept, Accept-Encoding" },
      });
    }

    if (negotiated === "text/markdown") {
      const markdownUrl = new URL(pathname === "/" ? "/markdown" : `/markdown${pathname}`, req.url);
      const response = NextResponse.rewrite(markdownUrl);
      response.headers.set("Vary", "Accept, Accept-Encoding");
      return response;
    }
  }

  // Extract tokens from cookies
  const accessToken = req.cookies.get("accessToken")?.value;
  const refreshToken = req.cookies.get("refreshToken")?.value;

  // If the user is trying to access a protected route without any token, redirect to login
  if (isProtectedRoute && !accessToken && !refreshToken) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // If the access token is missing but refresh token is available, refresh the access token
  if (!accessToken && refreshToken) {
    try {
      const newAccessToken = await refreshAccessToken(refreshToken);

      // Add the new access token to the cookies
      const response = htmlResponse();
      response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        path: "/",
        maxAge: ACCESS_TOKEN_EXPIRATION,
      });

      // Check if the user was navigating to an auth route, if so, redirect to the appropriate dashboard
      if (req.nextUrl.pathname.startsWith("/auth")) {
        // Get user info from the refresh token
        const { payload } = await jwtVerify(
          refreshToken,
          new TextEncoder().encode(REFRESH_TOKEN_SECRET)
        );
        const user = payload as {
          userId: string;
          username: string;
          role: string;
        };

        // Redirect Branch users to their branch page
        if (user.role === "Branch") {
          return NextResponse.redirect(new URL("/admin/branches/my", req.url));
        }
        // Redirect other users to dashboard
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
      // Verify the access token using shared auth module
      const payload = await verifyToken(accessToken);

      const user = payload as {
        userId: string;
        username: string;
        role: string;
      };

      // Attach user information to the request for later use in API routes
      req.user = user;

      // Role-based access control
      if (req.nextUrl.pathname.startsWith("/admin") && user.role.toLowerCase() !== "admin") {
        // Branch users should only access branch-related routes
        if (user.role === "Branch") {
          // Allow branch users only to access their specific branch page and related pages
          if (
            req.nextUrl.pathname === "/admin/branches/my" ||
            req.nextUrl.pathname === "/admin/branches/my/partner-prices" ||
            req.nextUrl.pathname.startsWith("/admin/branches/my/partner-prices/")
          ) {
            return htmlResponse();
          } else if (req.nextUrl.pathname === "/admin" || req.nextUrl.pathname === "/admin/") {
            // Redirect to their branch page if they try to access the admin home
            return NextResponse.redirect(new URL("/admin/branches/my", req.url));
          } else {
            // Add an error message as a searchParam and redirect to their branch page
            const redirectUrl = new URL("/admin/branches/my", req.url);
            redirectUrl.searchParams.set("unauthorized", "true");
            redirectUrl.searchParams.set("attempted", req.nextUrl.pathname);
            return NextResponse.redirect(redirectUrl);
          }
        }
        return NextResponse.redirect(new URL("/dashboard", req.url));
      } else if (
        req.nextUrl.pathname.startsWith("/dashboard") &&
        user.role.toLowerCase() === "admin"
      ) {
        return NextResponse.redirect(new URL("/admin", req.url));
      } else if (req.nextUrl.pathname.startsWith("/dashboard") && user.role === "Branch") {
        // Redirect branch users from dashboard to their branch page
        return NextResponse.redirect(new URL("/admin/branches/my", req.url));
      }

      // If a logged-in user tries to access auth routes, redirect to the appropriate page
      if (req.nextUrl.pathname.startsWith("/auth") && user) {
        if (user.role === "Branch") {
          return NextResponse.redirect(new URL("/admin/branches/my", req.url));
        }
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      return htmlResponse(); // Proceed to the requested route if all checks pass
    } catch (error) {
      console.error("Access token verification error:", error);

      // Handle 401 errors - try to refresh token and retry the request
      if (refreshToken) {
        try {
          const newAccessToken = await refreshAccessToken(refreshToken);

          // Create a new response with the refreshed token
          const response = htmlResponse();
          response.cookies.set("accessToken", newAccessToken, {
            httpOnly: true,
            path: "/",
            maxAge: ACCESS_TOKEN_EXPIRATION,
          });

          // Get user info from the refresh token to attach to the request
          const { payload } = await jwtVerify(
            refreshToken,
            new TextEncoder().encode(REFRESH_TOKEN_SECRET)
          );
          const user = payload as {
            userId: string;
            username: string;
            role: string;
          };

          // Attach user info to request for downstream middleware/handlers
          req.user = user;

          return response; // Retry the original request with new token
        } catch (refreshError) {
          console.error("Failed to refresh token after 401:", refreshError);
          // If refresh token is invalid, redirect to login
          return NextResponse.redirect(new URL("/auth/login", req.url));
        }
      } else {
        // No refresh token available, redirect to login
        return NextResponse.redirect(new URL("/auth/login", req.url));
      }
    }
  }

  // Proceed if no token is needed and no refresh process is triggered
  return htmlResponse();
}

// Specify the routes where this middleware should be applied
export const config = {
  matcher: [
    // "/dashboard/:path*", // Protect all subroutes of /dashboard
    // "/admin/:path*", // Protect all subroutes of /admin-panel
    // "/auth/:path*", // Protect all auth routes
    "/:path*",
  ],
};
