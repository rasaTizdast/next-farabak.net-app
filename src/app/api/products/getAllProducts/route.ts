// app/api/products/getAllProducts/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";

/**
 * @swagger
 * /api/products/getAllProducts:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products with pagination
 *     description: Returns a paginated list of products in the database.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to fetch.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of products to return per page.
 *     responses:
 *       200:
 *         description: A paginated list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ProductId:
 *                         type: integer
 *                       Name:
 *                         type: string
 *                       Type:
 *                         type: string
 *                       Price:
 *                         type: number
 *                       Discount:
 *                         type: number
 *                       CategoryContentId:
 *                         type: string
 *                       img1:
 *                         type: string
 *                       img2:
 *                         type: string
 *                       Available:
 *                         type: boolean
 *                       Description:
 *                         type: string
 *                       CategoryId:
 *                         type: integer
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       404:
 *         description: No products found
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request) {
  try {
    // Extract query parameters for pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    // Calculate the offset based on page and limit
    const offset = (page - 1) * limit;

    // Connect to the database
    const pool = await connectToDatabase();

    // Count total products
    const totalCountResult = await pool
      .request()
      .query("SELECT COUNT(*) AS totalCount FROM Support.Product");
    const totalCount = totalCountResult.recordset[0].totalCount;
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch paginated products
    const result = await pool
      .request()
      .query(
        `SELECT * FROM Support.Product ORDER BY ProductId OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`
      );

    // Return 404 if no products found
    if (result.recordset.length === 0) {
      return new NextResponse("No products found", { status: 404 });
    }

    // Structure response with pagination metadata
    const response = {
      data: result.recordset,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching products: ", error);
    return new NextResponse("Failed to fetch products", { status: 500 });
  }
}
