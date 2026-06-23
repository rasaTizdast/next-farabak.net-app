import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma"; // Ensure Prisma client is configured correctly

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

/**
 * @swagger
 * /api/admin/products/{productId}/updateImages:
 *   patch:
 *     summary: Update product images
 *     description: Updates one or both images (`img1`, `img2`) of a specific product.
 *     tags:
 *       - Admin
 *     parameters:
 *       - in: path
 *         name: productId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the product to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               img1:
 *                 type: string
 *                 description: The URL of the first image.
 *                 example: "productImages/example-product/new-mini.jpg"
 *               img2:
 *                 type: string
 *                 description: The URL of the second image.
 *                 example: "productImages/example-product/example-product-banner.jpg"
 *             required:
 *               - img1
 *     responses:
 *       200:
 *         description: Product images updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product images updated successfully."
 *                 product:
 *                   type: object
 *                   properties:
 *                     ProductId:
 *                       type: integer
 *                       example: 1
 *                     Name:
 *                       type: string
 *                       example: "Example Product"
 *                     img1:
 *                       type: string
 *                       example: "productImages/example-product/new-mini.jpg"
 *                     img2:
 *                       type: string
 *                       example: "productImages/example-product/example-product-banner.jpg"
 *       400:
 *         description: Bad request, missing or invalid parameters.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "At least one of 'img1' or 'img2' is required to update."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Failed to update product images."
 */

export async function PATCH(request: Request, props: { params: Promise<{ productId: string }> }) {
  const params = await props.params;
  const productId = parseInt(params.productId, 10);

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "Authorization token required" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const userRole = decoded.role;

    if (!userRole || userRole !== "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Validate input
    if (!productId) {
      return NextResponse.json({ error: "Product ID is required." }, { status: 400 });
    }

    // Parse the request body
    const { img1, img2 } = await request.json();
    if (!img1 && !img2) {
      return NextResponse.json(
        { error: "At least one of 'img1' or 'img2' is required to update." },
        { status: 400 }
      );
    }

    // Build update data object dynamically
    const updateData: { img1?: string; img2?: string } = {};
    if (img1) updateData.img1 = img1;
    if (img2) updateData.img2 = img2;

    // Update the product images in the database
    const updatedProduct = await prisma.product.update({
      where: { ProductId: productId },
      data: updateData,
    });

    return NextResponse.json({
      message: "Product images updated successfully.",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update product images." }, { status: 500 });
  }
}
