import { NextResponse } from "next/server";

import { serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { branchProductQuerySchema, validateParams } from "@/lib/validation";

/**
 * @swagger
 * /api/admin/branches/product-quantity/{productId}:
 *   get:
 *     summary: Get the total quantity of a product across all branches
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the product
 *     responses:
 *       200:
 *         description: Total quantity of the product across all branches
 *       500:
 *         description: Server error
 */
export async function GET(request: Request, props: { params: Promise<{ productId: string }> }) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  const paramValidation = validateParams(params, branchProductQuerySchema);
  if ("error" in paramValidation) return paramValidation.error;
  try {
    const productId = paramValidation.data.productId;

    // Get the total quantity of the product across all branches
    const result = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT COALESCE(SUM("quantity"), 0) as "totalQuantity"
      FROM "support"."branchproduct"
      WHERE "ProductId" = ${productId}
    `;

    const totalQuantity = (result[0]?.totalQuantity as number) || 0;

    return NextResponse.json({
      productId,
      totalQuantity: Number(totalQuantity),
    });
  } catch (error) {
    console.error("Error getting product quantity:", error);
    return serverErrorResponse("خطا در دریافت تعداد محصول");
  }
}
