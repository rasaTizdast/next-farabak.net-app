import { jwtVerify, SignJWT } from "jose";
import { NextResponse, NextRequest } from "next/server";

import { verifyToken } from "@/lib/auth";
import { negotiate } from "@/lib/contentNegotiation";
import type { ProductDetailPageResolution } from "@/lib/data/product-page-validation";
import {
  type CatalogPageCheck,
  getCatalogPageCheck,
  getStaticMarkdownPage,
  markdownKeyFromPath,
} from "@/lib/markdownContent";
import { getLegacyImageRedirect } from "@/lib/seo/legacy-image-redirects";
import {
  getVerifiedListingQueryRedirect,
  getVerifiedPageOnePathRedirect,
} from "@/lib/seo/verified-pagination-redirects";

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
function htmlResponse(standaloneMarkdown = false) {
  const response = NextResponse.next();
  response.headers.append("Vary", "Accept");
  if (standaloneMarkdown) response.headers.set("X-Robots-Tag", "noindex");
  return response;
}

const HTML_ONLY_PAGE_KEYS = new Set([
  "about-us/activity",
  "about-us/members",
  "about-us/projects",
  "auth/login",
  "auth/signup",
  "product-finder",
  "product-finder/board",
  "product-finder/report",
  "products/search",
  "support/blog",
  "support/download-center",
  "support/faq",
  "support/tools",
  "support/tools/cctv-storage",
  "support/tools/meeting-room",
  "support/tools/xray-fit",
  "support/warranty-tracking",
  "swagger",
]);

function getProductPageCheck(req: NextRequest): CatalogPageCheck {
  const pathKey = markdownKeyFromPath(req.nextUrl.pathname);
  if (pathKey !== "products" && !pathKey.startsWith("products/")) return null;

  try {
    return getCatalogPageCheck(
      pathKey.split("/").map(decodeURIComponent),
      req.nextUrl.searchParams
    );
  } catch {
    return "not-found";
  }
}

async function hasProductPageData(check: Exclude<CatalogPageCheck, "not-found" | null>) {
  const { hasProductDetailPage, hasProductListingPage } =
    await import("@/lib/data/product-page-validation");
  return check.type === "product" ? hasProductDetailPage(check) : hasProductListingPage(check);
}

async function hasBlogCategoryData(categorySlug: string) {
  const { hasBlogCategoryPage } = await import("@/lib/data/blog-page-validation");
  return hasBlogCategoryPage(categorySlug);
}

async function hasHtmlOnlyDetailPage(pathKey: string, key: string | null): Promise<boolean | null> {
  const article = /^support\/blog\/[^/]+\/([^/]+)$/.exec(pathKey);
  const about = /^about-us\/(members|projects)\/([^/]+)$/.exec(pathKey);
  const slugParam = article?.[1] ?? about?.[2];
  if (!slugParam) return null;

  let slug: string;
  try {
    slug = decodeURIComponent(slugParam);
  } catch {
    return false;
  }
  const { prisma } = await import("@/lib/prisma");
  if (article) {
    const post = await prisma.blogs.findUnique({
      where: { slug, status: "Published" },
      select: { QrCode_key: true, QrCode_expiryDays: true },
    });
    if (!post) return false;
    if (!post.QrCode_key) return true;
    return (
      post.QrCode_key === key &&
      (!post.QrCode_expiryDays || new Date(post.QrCode_expiryDays) >= new Date())
    );
  }

  if (about?.[1] === "members") {
    return Boolean(
      await prisma.members.findUnique({ where: { Slug: slug }, select: { Membersid: true } })
    );
  }
  return Boolean(
    await prisma.projects.findFirst({ where: { Slug: slug }, select: { ProjectID: true } })
  );
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
  const isDocumentRequest = isDocumentMethod && req.headers.get("RSC") !== "1";
  const productPageCheck = isDocumentRequest ? getProductPageCheck(req) : null;
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
  let productDetailResolution: ProductDetailPageResolution | null | undefined;

  if (isFarabakHost) {
    canonicalUrl.protocol = "https:";
    canonicalUrl.hostname = isWwwHost ? "farabak.net" : requestHostname;
    canonicalUrl.port = "";
  }

  if (isFarabakHost && isDocumentMethod) {
    const imageDestination = getLegacyImageRedirect(pathname);
    if (imageDestination) return NextResponse.redirect(imageDestination, 308);
  }

  if (isDocumentMethod) {
    const queryPageValues = req.nextUrl.searchParams.getAll("page");
    const queryPageDestination =
      isFarabakHost &&
      queryPageValues.length === 1 &&
      (queryPageValues[0] !== "2" || req.nextUrl.searchParams.size === 1)
        ? getVerifiedListingQueryRedirect(pathname, queryPageValues[0])
        : null;
    const pageOnePathDestination = isFarabakHost ? getVerifiedPageOnePathRedirect(pathname) : null;

    if (pathname === "/products/industrial-cctv-camera/explosion-proof-cctv-camera") {
      canonicalUrl.pathname = "/products/industrial-cctv-camera/black-wonder";
      shouldRedirect = true;
    } else if (pageOnePathDestination) {
      canonicalUrl.pathname = pageOnePathDestination;
      shouldRedirect = true;
    } else if (queryPageDestination) {
      canonicalUrl.pathname = queryPageDestination;
      canonicalUrl.searchParams.delete("page");
      shouldRedirect = true;
    } else if (pathname === "/products/x-ray/airport-luggage/ctx-9800") {
      canonicalUrl.pathname = "/products/x-ray/airport-luggage/ctx-9800-dsi";
      shouldRedirect = true;
    }
  }

  if (isFarabakHost && isDocumentRequest && canonicalUrl.pathname === pathname) {
    if (
      productPageCheck !== null &&
      productPageCheck !== "not-found" &&
      productPageCheck.type === "product"
    ) {
      try {
        const { resolveProductDetailPage } = await import("@/lib/data/product-page-validation");
        productDetailResolution = await resolveProductDetailPage(productPageCheck);
        if (!productDetailResolution) return rewriteToNotFound(req);

        if (productDetailResolution.shouldRedirect) {
          canonicalUrl.pathname = productDetailResolution.canonicalPath;
          canonicalUrl.searchParams.delete("key");
          shouldRedirect = true;
        }
      } catch {
        console.error("Product page validation failed before rendering.");
      }
    }
  }

  if (shouldRedirect) {
    return NextResponse.redirect(canonicalUrl, 308);
  }

  const isProtectedRoute = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  let isValidatedBlogCategory = false;
  if (isDocumentRequest) {
    if (productPageCheck === "not-found") return rewriteToNotFound(req);

    if (productPageCheck) {
      try {
        if (productPageCheck.type === "product" && productDetailResolution) {
          if (productDetailResolution.shouldRedirect) {
            canonicalUrl.pathname = productDetailResolution.canonicalPath;
            canonicalUrl.searchParams.delete("key");
            return NextResponse.redirect(canonicalUrl, 308);
          }
        } else if (!(await hasProductPageData(productPageCheck))) {
          return rewriteToNotFound(req);
        }
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
        isValidatedBlogCategory = await hasBlogCategoryData(blogCategorySegments[2]);
        if (!isValidatedBlogCategory) {
          return rewriteToNotFound(req);
        }
      } catch {
        console.error("Blog category validation failed before rendering.");
      }
    }
  }

  const pathKey = markdownKeyFromPath(pathname);
  const standaloneMarkdown = pathKey === "markdown" || pathKey.startsWith("markdown/");

  if (isDocumentRequest && !isProtectedRoute && !standaloneMarkdown) {
    const catalogPage = productPageCheck === "not-found" ? null : productPageCheck;
    const hasMarkdown = Boolean(catalogPage || getStaticMarkdownPage(pathKey));
    const accept = req.headers.get("accept");
    let negotiated = hasMarkdown ? negotiate(accept) : negotiate(accept, ["text/html"]);

    if (
      negotiated === "text/markdown" &&
      catalogPage?.type === "product" &&
      catalogPage.key !== null &&
      negotiate(accept, ["text/html"]) !== null
    ) {
      try {
        if (!(await hasProductPageData({ ...catalogPage, key: null }))) negotiated = "text/html";
      } catch {
        negotiated = "text/html";
      }
    }

    if (negotiated === null) {
      let hasPage = hasMarkdown || isValidatedBlogCategory || HTML_ONLY_PAGE_KEYS.has(pathKey);
      if (!hasPage) {
        try {
          const hasDetail = await hasHtmlOnlyDetailPage(
            pathKey,
            req.nextUrl.searchParams.get("key")
          );
          if (hasDetail === false) return rewriteToNotFound(req);
          hasPage = hasDetail === true;
        } catch {
          console.error("HTML representation validation failed before rendering.");
        }
      }
      if (hasPage) {
        return new NextResponse(req.method === "HEAD" ? null : "Not Acceptable", {
          status: 406,
          headers: { "Content-Type": "text/plain; charset=utf-8", Vary: "Accept, Accept-Encoding" },
        });
      }
    }

    if (negotiated === "text/markdown") {
      const markdownUrl = new URL(pathname === "/" ? "/markdown" : `/markdown${pathname}`, req.url);
      if (pathKey === "products" && catalogPage?.type === "all" && catalogPage.page > 1) {
        markdownUrl.searchParams.set("page", String(catalogPage.page));
      }
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
      const response = htmlResponse(standaloneMarkdown);
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
            return htmlResponse(standaloneMarkdown);
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

      return htmlResponse(standaloneMarkdown); // Proceed to the requested route if all checks pass
    } catch (error) {
      console.error("Access token verification error:", error);

      // Handle 401 errors - try to refresh token and retry the request
      if (refreshToken) {
        try {
          const newAccessToken = await refreshAccessToken(refreshToken);

          // Create a new response with the refreshed token
          const response = htmlResponse(standaloneMarkdown);
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
  return htmlResponse(standaloneMarkdown);
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
