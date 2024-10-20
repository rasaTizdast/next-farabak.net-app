// app/api/products/getProductsByCategory/[categoryId]/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";

/**
 * @swagger
 * /api/products/getProductsByCategory/{categoryId}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get products by category
 *     description: Returns a list of products filtered by category ID.
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The category ID to filter products by
 *     responses:
 *       200:
 *         description: A list of filtered products
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
 *                     nullable: true
 *                   Discount:
 *                     type: number
 *                     nullable: true
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
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  const categoryId = params.categoryId;

  try {
    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input("categoryId", categoryId)
      .query("SELECT * FROM Support.Product WHERE CategoryId = @categoryId");

    // Check if no products are found in the category
    if (result.recordset.length === 0) {
      return new NextResponse("No products found for this category", {
        status: 404,
      });
    }

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching products by category: ", error);
    return new NextResponse("Failed to fetch products by category", {
      status: 500,
    });
  }
}
