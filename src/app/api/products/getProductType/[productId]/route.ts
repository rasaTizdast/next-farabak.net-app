import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/products/getProductType/{productId}:
 *   get:
 *     description: Fetch the product type based on the productId
 *     tags:
 *       - Products
 *     summary: Get Product Type by Product ID
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: The ID of the product to retrieve the type for
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved the product type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productType:
 *                   type: string
 *                   example: "Argus Eco"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch product type"
 */

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  const productId = parseInt(params.productId, 10);

  if (isNaN(productId)) {
    return new NextResponse("Invalid Product ID", { status: 400 });
  }

  try {
    // Retrieve the Type field based on the productId from the Support.Product table
    const product = await prisma.product.findUnique({
      where: { ProductId: productId },
      select: { Type: true },
    });

    // If no product is found, return a 404 error
    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Return the product type in the response
    return NextResponse.json({ productType: product.Type });
  } catch (error) {
    console.error("Error fetching product type: ", error);
    return new NextResponse("Failed to fetch product type", { status: 500 });
  }
}
