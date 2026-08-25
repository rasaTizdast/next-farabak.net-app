import { NextResponse } from "next/server";

import { unauthorizedResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  validateParams,
  validateBody,
  productIdParamSchema,
  updateProductImagesSchema,
} from "@/lib/validation";

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

  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    if (auth.role !== "Admin") {
      return unauthorizedResponse("Unauthorized");
    }

    const paramResult = validateParams(params, productIdParamSchema);
    if ("error" in paramResult) return paramResult.error;
    const productId = paramResult.data.productId;

    // Validate the request body
    const result = await validateBody(request, updateProductImagesSchema);
    if ("error" in result) return result.error;
    const data = result.data;

    // Build update data object dynamically
    const updateData: { img1?: string; img2?: string } = {};
    if (data.img1 !== undefined) updateData.img1 = data.img1;
    if (data.img2 !== undefined) updateData.img2 = data.img2;

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
    return serverErrorResponse("Failed to update product images.");
  }
}
