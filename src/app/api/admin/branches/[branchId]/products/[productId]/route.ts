import { NextResponse } from "next/server";

import { notFoundResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  branchIdParamSchema,
  productIdParamSchema,
  updateBranchProductSchema,
  validateBody,
  validateParams,
} from "@/lib/validation";

/**
 * @swagger
 * /api/admin/branches/{branchId}/products/{productId}:
 *   put:
 *     summary: Update the quantity of a product in a branch
 *     parameters:
 *       - name: branchId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the branch
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               quantity:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Product quantity updated
 *       400:
 *         description: Bad request - missing fields
 *       404:
 *         description: Branch product not found
 *       500:
 *         description: Server error
 */
export async function PUT(
  request: Request,
  props: { params: Promise<{ branchId: string; productId: string }> }
) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  const branchParamValidation = validateParams(params, branchIdParamSchema);
  if ("error" in branchParamValidation) return branchParamValidation.error;
  const productParamValidation = validateParams(params, productIdParamSchema);
  if ("error" in productParamValidation) return productParamValidation.error;
  const bodyValidation = await validateBody(request, updateBranchProductSchema);
  if ("error" in bodyValidation) return bodyValidation.error;
  try {
    const branchId = branchParamValidation.data.branchId;
    const productId = productParamValidation.data.productId;
    const { quantity } = bodyValidation.data;

    // Check if branch product exists
    const branchProductResult = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM "support"."branchproduct"
      WHERE "branchid" = ${branchId} AND "ProductId" = ${productId}
    `;

    if (branchProductResult.length === 0) {
      return notFoundResponse("محصول در این شعبه یافت نشد");
    }

    // Update product quantity
    const updatedProduct = await prisma.$queryRaw<Record<string, unknown>[]>`
      UPDATE "support"."branchproduct"
      SET "quantity" = ${quantity}
      WHERE "branchid" = ${branchId} AND "ProductId" = ${productId}
      RETURNING *
    `;

    return NextResponse.json(updatedProduct[0]);
  } catch (error) {
    console.error("Error updating branch product:", error);
    return serverErrorResponse("خطا در بروزرسانی محصول شعبه");
  }
}

/**
 * @swagger
 * /api/admin/branches/{branchId}/products/{productId}:
 *   delete:
 *     summary: Remove a product from a branch
 *     parameters:
 *       - name: branchId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the branch
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product
 *     responses:
 *       200:
 *         description: Product removed from branch
 *       404:
 *         description: Branch product not found
 *       500:
 *         description: Server error
 */
export async function DELETE(
  request: Request,
  props: { params: Promise<{ branchId: string; productId: string }> }
) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  const branchParamValidation = validateParams(params, branchIdParamSchema);
  if ("error" in branchParamValidation) return branchParamValidation.error;
  const productParamValidation = validateParams(params, productIdParamSchema);
  if ("error" in productParamValidation) return productParamValidation.error;
  try {
    const branchId = branchParamValidation.data.branchId;
    const productId = productParamValidation.data.productId;

    // Check if branch product exists
    const branchProductResult = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM "support"."branchproduct"
      WHERE "branchid" = ${branchId} AND "ProductId" = ${productId}
    `;

    if (branchProductResult.length === 0) {
      return notFoundResponse("محصول در این شعبه یافت نشد");
    }

    // Delete branch product
    await prisma.$queryRaw<Record<string, unknown>[]>`
      DELETE FROM "support"."branchproduct"
      WHERE "branchid" = ${branchId} AND "ProductId" = ${productId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting branch product:", error);
    return serverErrorResponse("خطا در حذف محصول از شعبه");
  }
}
