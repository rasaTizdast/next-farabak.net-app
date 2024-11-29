import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";

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
    const pool = await connectToDatabase();

    // Retrieve the Type field based on the productId from the Support.Product table
    const productResult = await pool
      .request()
      .input("productId", productId)
      .query("SELECT Type FROM Support.Product WHERE ProductId = @productId");

    // If no product is found, return a 404 error
    if (productResult.recordset.length === 0) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Extract product type from the result
    const productType = productResult.recordset[0].Type;

    // Return the product type in the response
    return NextResponse.json({ productType });
  } catch (error) {
    console.error("Error fetching product type: ", error);
    return new NextResponse("Failed to fetch product type", { status: 500 });
  }
}
