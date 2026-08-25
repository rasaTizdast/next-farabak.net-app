import { NextResponse } from "next/server";

import { unauthorizedResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const userRole = auth.role;

    // Only admin and branch users can access this endpoint
    if (!userRole || (userRole !== "Admin" && userRole !== "Branch")) {
      return unauthorizedResponse(
        "Unauthorized: Only admin and branch users can access this endpoint"
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
        ProductGrade: {
          select: {
            ProductGradeId: true,
            Grade: true,
            Price: true,
          },
        },
        Minimum_Amount: true,
        Maximum_Amount: true,
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
      return notFoundResponse("No products found");
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
    return serverErrorResponse("Failed to fetch products");
  }
}
