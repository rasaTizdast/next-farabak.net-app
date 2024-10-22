import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import { escape } from "validator"; // Sanitize user input

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     tags:
 *       - Products
 *     summary: Search for products by description keywords
 *     description: Returns a list of products that match the search input.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: Search query containing keywords separated by spaces.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of matching products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ProductId:
 *                     type: integer
 *                   Name:
 *                     type: string
 *                   Type:
 *                     type: string
 *                   Price:
 *                     type: number
 *                   Discount:
 *                     type: number
 *                   CategoryContentId:
 *                     type: string
 *                   img1:
 *                     type: string
 *                   img2:
 *                     type: string
 *                   Available:
 *                     type: boolean
 *                   Description:
 *                     type: string
 *                   CategoryId:
 *                     type: integer
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

  // Check if query is empty
  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "Invalid search query" },
      { status: 400 }
    );
  }

  // Sanitize and split the query into individual keywords
  const keywords = escape(query.trim()).split(/\s+/);

  try {
    const pool = await connectToDatabase();

    // Fetch all products from the database
    const result = await pool.request().query("SELECT * FROM Support.Product");

    // Filter products that match any of the keywords in their description
    const matchingProducts = result.recordset.filter((product) => {
      // Split the description into keywords (assuming they are space-separated)
      const descriptionKeywords = product.Description.split(/\s+/);

      // Check if any of the search keywords match the description keywords
      return keywords.some((keyword) =>
        descriptionKeywords.some((descWord: string) =>
          descWord.toLowerCase().includes(keyword.toLowerCase())
        )
      );
    });

    // If no products match, return a 404 response
    if (matchingProducts.length === 0) {
      return new NextResponse("No matching products found", { status: 404 });
    }

    // Return the matching products
    return NextResponse.json(matchingProducts);
  } catch (error) {
    console.error("Error fetching products: ", error);
    return new NextResponse("Failed to search products", { status: 500 });
  }
}
