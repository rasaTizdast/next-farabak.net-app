// app/api/products/getProductById/[productId]/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";

/**
 * @swagger
 * /api/products/getProductById/{productId}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get a product by ID
 *     description: Returns a specific product based on the product ID.
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the product to fetch
 *     responses:
 *       200:
 *         description: A specific product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ProductId:
 *                   type: integer
 *                 Name:
 *                   type: string
 *                 Type:
 *                   type: string
 *                 Price:
 *                   type: number
 *                   nullable: true
 *                 Discount:
 *                   type: number
 *                   nullable: true
 *                 CategoryContentId:
 *                   type: string
 *                 img1:
 *                   type: string
 *                 img2:
 *                   type: string
 *                 Available:
 *                   type: boolean
 *                 Description:
 *                   type: string
 *                 CategoryId:
 *                   type: integer
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    // Connect to the database
    const pool = await connectToDatabase();

    // Query to get a product by ID
    const result = await pool
      .request()
      .input("ProductId", params.productId) // Bind the productId parameter
      .query("SELECT * FROM Support.Product WHERE ProductId = @ProductId");

    // Check if the product is found
    if (result.recordset.length === 0) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Return the product data as a JSON response
    return NextResponse.json(result.recordset[0]); // Return the first object
  } catch (error) {
    console.error("Error fetching product by ID: ", error);

    // Return a server error response
    return new NextResponse("Failed to fetch product", { status: 500 });
  }
}
