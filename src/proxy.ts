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
  | {
      type: "product";
      category: string;
      subcategory: string;
      product: string;
      key: string | null;
    }
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

  if (segments.length === 4 && segments[2] !== "page") {
    return {
      type: "product",
      category: segments[1],
      subcategory: segments[2],
      product: segments[3],
      key: req.nextUrl.searchParams.get("key"),
    };
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
  const { hasProductDetailPage, hasProductListingPage } =
    await import("@/lib/data/product-page-validation");
  return check.type === "product" ? hasProductDetailPage(check) : hasProductListingPage(check);
}

async function hasBlogCategoryData(categorySlug: string) {
  const { hasBlogCategoryPage } = await import("@/lib/data/blog-page-validation");
  return hasBlogCategoryPage(categorySlug);
}

function rewriteToNotFound(req: NextRequest) {
  // An unmatched route renders app/not-found.tsx before a route loading boundary can send 200.
  const unmatchedUrl = new URL("/_product-listing-not-found", req.url);
  return NextResponse.rewrite(unmatchedUrl, { headers: { "Cache-Control": "no-store" } });
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

  const isDocumentMethod = req.method === "GET" || req.method === "HEAD";
  const forwardedHost = req.headers.get("x-forwarded-host")?.split(",", 1)[0]?.trim();
  const requestHost = forwardedHost || req.headers.get("host") || req.nextUrl.hostname;
  const requestHostname = requestHost.replace(/:\d+$/, "").toLowerCase();
  const isWwwHost = requestHostname === "www.farabak.net";
  const isFarabakHost = isWwwHost || requestHostname === "farabak.net";
  const forwardedProtocol = req.headers
    .get("x-forwarded-proto")
    ?.split(",", 1)[0]
    ?.trim()
    .replace(/:$/, "")
    .toLowerCase();
  const requestProtocol = forwardedProtocol || new URL(req.url).protocol.replace(/:$/, "");
  const canonicalUrl = new URL(req.url);
  let shouldRedirect = isWwwHost || (isFarabakHost && requestProtocol !== "https");

  if (isFarabakHost) {
    canonicalUrl.protocol = "https:";
    canonicalUrl.hostname = isWwwHost ? "farabak.net" : requestHostname;
    canonicalUrl.port = "";
  }

  if (isDocumentMethod) {
    const segments = pathname.split("/").filter(Boolean);

    if (
      pathname === "/products" &&
      req.nextUrl.searchParams.getAll("page").length === 1 &&
      req.nextUrl.searchParams.get("page") === "1"
    ) {
      canonicalUrl.searchParams.delete("page");
      shouldRedirect = true;
    } else if (
      segments.length === 3 &&
      segments[0] === "products" &&
      segments[1] === "page" &&
      segments[2] === "1"
    ) {
      canonicalUrl.pathname = "/products";
      shouldRedirect = true;
    } else if (
      segments[0] === "products" &&
      segments.length === 4 &&
      segments[2] === "page" &&
      segments[3] === "1"
    ) {
      canonicalUrl.pathname = `/products/${segments[1]}`;
      shouldRedirect = true;
    } else if (
      segments[0] === "products" &&
      segments.length === 5 &&
      segments[3] === "page" &&
      segments[4] === "1"
    ) {
      canonicalUrl.pathname = `/products/${segments[1]}/${segments[2]}`;
      shouldRedirect = true;
    } else if (pathname === "/products/x-ray/airport-luggage/ctx-9800") {
      canonicalUrl.pathname = "/products/x-ray/airport-luggage/ctx-9800-dsi";
      shouldRedirect = true;
    }
  }

  if (shouldRedirect) {
    return NextResponse.redirect(canonicalUrl, 308);
  }

  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  const isDocumentRequest = req.headers.get("RSC") !== "1";
  if (isDocumentRequest && (req.method === "GET" || req.method === "HEAD")) {
    const productPageCheck = getProductPageCheck(req);
    if (productPageCheck === "not-found") return rewriteToNotFound(req);

    if (productPageCheck) {
      try {
        if (!(await hasProductPageData(productPageCheck))) return rewriteToNotFound(req);
      } catch {
        console.error("Product page validation failed before rendering.");
      }
    }

    const blogCategorySegments = pathname.split("/").filter(Boolean);
    if (
      blogCategorySegments.length === 3 &&
      blogCategorySegments[0] === "support" &&
      blogCategorySegments[1] === "blog"
    ) {
      try {
        if (!(await hasBlogCategoryData(blogCategorySegments[2]))) {
          return rewriteToNotFound(req);
        }
      } catch {
        console.error("Blog category validation failed before rendering.");
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
