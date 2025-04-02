import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/admin/products/all:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all products without pagination for use in dropdown selectors
 *     description: Returns a complete list of products without pagination. This endpoint is optimized for populating product selectors.
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Complete list of products
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No products found
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    // Get the access token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Verify and decode the token
    const decoded = await verifyToken(token);
    const userRole = decoded.role;

    // Only admin and branch users can access this endpoint
    if (!userRole || (userRole !== "Admin" && userRole !== "Branch")) {
      return NextResponse.json(
        {
          error:
            "Unauthorized: Only admin and branch users can access this endpoint",
        },
        { status: 401 }
      );
    }

    // Fetch all products but only select fields needed for dropdowns
    const prismaPromise = prisma.product.findMany({
      select: {
        ProductId: true,
        Type: true,
        Name: true,
        Price: true,
        Discount: true,
        Available: true,
        CategoryId: true,
        Category: {
          select: {
            Name: true,
          },
        },
      },
      orderBy: {
        ProductId: "asc",
      },
    });

    let products;
    try {
      products = await prismaPromise;
    } catch (prismaError) {
      console.error("[PRODUCTS-ALL-API] Prisma query error:", prismaError);
      throw prismaError;
    }

    if (products.length === 0) {
      return new NextResponse(JSON.stringify({ error: "No products found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Check first few products structure
    if (products.length > 0) {
    }

    // Return in the same format as the original endpoint
    const response = {
      data: products,
      pagination: {
        totalCount: products.length,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("[PRODUCTS-ALL-API] Error fetching all products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
