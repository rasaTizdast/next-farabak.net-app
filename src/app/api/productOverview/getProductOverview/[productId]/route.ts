// app/api/productOverview/getProductOverview/[productId]/route.ts
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
  props: { params: Promise<{ productId: string }> }
) {
  const params = await props.params;
  try {
    // Query to get product overview by product ID
    const result = await prisma.productOverview.findFirst({
      where: { ProductId: +params.productId },
    });

    // If no matching product overviews found, return a "No product found" message
    if (!result) {
      return NextResponse.json(
        { message: "No product found for the given ID" },
        { status: 404 }
      );
    }

    // Return the product overview data as a JSON response
    return NextResponse.json(result);
  } catch (error) {
    // Return a server error response
    return new NextResponse("Failed to fetch product overview", {
      status: 500,
    });
  }
}
