// app/api/products/getProductSpecsByProductId/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";

/**
 * @swagger
 * /api/products/getProductSpecsByProductId:
 *   get:
 *     tags:
 *       - Product Specs
 *     summary: Get product specifications by ProductId
 *     description: Returns a list of product specifications for the given ProductId.
 *     parameters:
 *       - in: query
 *         name: productId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ProductId for which to fetch product specifications.
 *     responses:
 *       200:
 *         description: A list of product specifications for the given ProductId
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
 *                       SpecId:
 *                         type: integer
 *                       ProductId:
 *                         type: integer
 *                       SpecName:
 *                         type: string
 *                       SpecValue:
 *                         type: string
 *                       CreatedAt:
 *                         type: string
 *                         format: date-time
 *       400:
 *         description: Invalid ProductId provided
 *       404:
 *         description: No specifications found for the given ProductId
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request) {
  try {
    // Extract the ProductId from the query parameters
    const { searchParams } = new URL(request.url);
    const productId = parseInt(searchParams.get("productId") || "", 10);

    // Return 400 if ProductId is missing or invalid
    if (isNaN(productId)) {
      return new NextResponse("Invalid ProductId", { status: 400 });
    }

    // Connect to the database
    const pool = await connectToDatabase();

    // Fetch the product specifications for the given ProductId
    const result = await pool
      .request()
      .input("ProductId", productId)
      .query(`SELECT * FROM Support.ProductSpecs WHERE ProductId = @ProductId`);

    // Return 404 if no product specifications found
    if (result.recordset.length === 0) {
      return new NextResponse(
        "No specifications found for the given ProductId",
        { status: 404 }
      );
    }

    // Return the specifications
    return NextResponse.json({ data: result.recordset });
  } catch (error) {
    console.error("Error fetching product specifications: ", error);
    return new NextResponse("Failed to fetch product specifications", {
      status: 500,
    });
  }
}
