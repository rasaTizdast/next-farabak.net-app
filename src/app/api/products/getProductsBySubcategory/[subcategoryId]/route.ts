// app/api/products/getProductsBySubcategory/[subcategoryId]/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";

/**
 * @swagger
 * /api/products/getProductsBySubcategory/{subcategoryId}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get products by subcategory
 *     description: Returns a list of products filtered by subcategory ID (CategoryContentId).
 *     parameters:
 *       - in: path
 *         name: subcategoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The subcategory ID to filter products by
 *     responses:
 *       200:
 *         description: A list of filtered products by subcategory
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
  { params }: { params: { subcategoryId: string } }
) {
  const subcategoryId = params.subcategoryId;

  try {
    const pool = await connectToDatabase();
    const result = await pool.request().input("subcategoryId", subcategoryId)
      .query(`SELECT * FROM Support.Product 
              WHERE CategoryContentId LIKE '%' + @subcategoryId + '%'`);

    // Check if no products are found in the subcategory
    if (result.recordset.length === 0) {
      return new NextResponse("No products found for this subcategory", {
        status: 404,
      });
    }

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching products by subcategory: ", error);
    return new NextResponse("Failed to fetch products by subcategory", {
      status: 500,
    });
  }
}
