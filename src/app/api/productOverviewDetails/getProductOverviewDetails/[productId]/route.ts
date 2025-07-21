import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/productOverviewDetails/getProductOverviewDetails/{productId}:
 *   get:
 *     summary: Retrieve detailed product overview by product ID
 *     description: Fetches product overview details including titles, descriptions, and images for a given product ID.
 *     tags: [ProductOverviewDetails]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         description: The ID of the product to get detailed overview for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Detailed product overview retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ProductOverviewDetailsId:
 *                     type: integer
 *                   Title:
 *                     type: string
 *                   Description:
 *                     type: string
 *                   Img:
 *                     type: string
 *                   ProductName:
 *                     type: string
 *       404:
 *         description: No product found for the given ID
 *       500:
 *         description: Internal server error
 */

export async function GET(
  request: Request,
  props: { params: Promise<{ productId: string }> }
) {
  const params = await props.params;
  const { productId } = params;

  if (!productId) {
    return NextResponse.json(
      { message: "Product ID is required" },
      { status: 400 }
    );
  }

  try {
    // Parse productId as integer
    const productIdInt = parseInt(productId, 10);

    if (isNaN(productIdInt)) {
      return NextResponse.json(
        { message: "Invalid product ID format" },
        { status: 400 }
      );
    }

    // Fetch data using Prisma
    const details = await prisma.details_ProductOverviewDetails.findMany({
      where: { productid: productIdInt },
      include: {
        Master_ProductOverviewDetails: true, // Join with the master table
      },
    });

    if (!details || details.length === 0) {
      return NextResponse.json(
        { message: "No product found for the given ID" },
        { status: 404 }
      );
    }

    // Transform data into the required format
    const response = details.map((detail) => ({
      ProductOverviewDetailsId: detail.ProductOverviewDetailsId,
      Title: detail.Master_ProductOverviewDetails?.Title || null,
      Description: detail.Master_ProductOverviewDetails?.Description || null,
      Img: detail.Master_ProductOverviewDetails?.Img || null,
      ProductName: detail.ProductName,
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch product overview details" },
      { status: 500 }
    );
  }
}
