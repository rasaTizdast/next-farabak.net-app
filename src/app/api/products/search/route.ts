import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import { escape } from "validator";

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     tags:
 *       - Products
 *     summary: Search for products by description keywords with pagination
 *     description: Returns a paginated list of products that match the search input.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: Search query containing keywords separated by spaces.
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination.
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of items per page.
 *         schema:
 *           type: integer
 *           default: 30
 *     responses:
 *       200:
 *         description: A list of matching products with pagination
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
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *       400:
 *         description: Invalid search query
 *       404:
 *         description: No matching products found
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "30", 10);

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "Invalid search query" },
      { status: 400 }
    );
  }

  const keywords = escape(query.trim()).split(/\s+/);

  try {
    const pool = await connectToDatabase();

    const result = await pool.request().query("SELECT * FROM Support.Product");

    const matchingProducts = result.recordset.filter((product) => {
      const descriptionKeywords = product.Description.split(/\s+/);
      return keywords.some((keyword) =>
        descriptionKeywords.some((descWord: string) =>
          descWord.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    });

    if (matchingProducts.length === 0) {
      return new NextResponse("No matching products found", { status: 404 });
    }

    const startIndex = (page - 1) * limit;
    const paginatedProducts = matchingProducts.slice(
      startIndex,
      startIndex + limit
    );

    return NextResponse.json({
      data: paginatedProducts,
      pagination: {
        totalPages: Math.ceil(matchingProducts.length / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error("Error fetching products: ", error);
    return new NextResponse("Failed to search products", { status: 500 });
  }
}
