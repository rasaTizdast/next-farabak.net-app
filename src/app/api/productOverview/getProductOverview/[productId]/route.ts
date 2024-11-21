// app/api/productOverview/getProductOverview/[productId]/route.ts
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";

/**
 * @swagger
 * /api/productOverview/getProductOverview/{productId}:
 *   get:
 *     summary: Retrieve product overview by product ID
 *     tags: [ProductOverview]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: The ID of the product to get overview for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Array of product overviews
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productId:
 *                     type: integer
 *                     description: ID of the product
 *                   property1:
 *                     type: string
 *                   property2:
 *                     type: string
 *                   property3:
 *                     type: string
 *                   property4:
 *                     type: string
 *       404:
 *         description: No product found
 *       500:
 *         description: Server error
 */

// Handler function for GET request
export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    // Connect to the database
    const pool = await connectToDatabase();

    // Query to get product overview by product ID
    const result = await pool
      .request()
      .input("ProductId", params.productId)
      .query(
        "SELECT ProductId, Property1, Property2, Property3, Property4 FROM Support.ProductOverview WHERE ProductId = @ProductId"
      );
    // Adjust table and column names as needed

    // If no matching product overviews found, return a "No product found" message
    if (result.recordset.length === 0) {
      return NextResponse.json(
        { message: "No product found for the given ID" },
        { status: 404 }
      );
    }

    // Return the product overview data as a JSON response
    return NextResponse.json(result.recordset[0]); // Return the array of product overviews
  } catch (error) {
    console.error("Error fetching product overview: ", error);

    // Return a server error response
    return new NextResponse("Failed to fetch product overview", {
      status: 500,
    });
  }
}
