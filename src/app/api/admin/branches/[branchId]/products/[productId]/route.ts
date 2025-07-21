import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  const params = await props.params;
  try {
    const branchId = parseInt(params.branchId);
    const productId = parseInt(params.productId);
    const { quantity } = await request.json();

    if (quantity === undefined) {
      return NextResponse.json({ error: "تعداد الزامی است" }, { status: 400 });
    }

    // Check if branch product exists
    const branchProductResult = await prisma.$queryRaw`
      SELECT * FROM "support"."branchproduct"
      WHERE "branchid" = ${branchId} AND "ProductId" = ${productId}
    `;

    if ((branchProductResult as any[]).length === 0) {
      return NextResponse.json(
        { error: "محصول در این شعبه یافت نشد" },
        { status: 404 }
      );
    }

    // Update product quantity
    const updatedProduct = await prisma.$queryRaw`
      UPDATE "support"."branchproduct"
      SET "quantity" = ${quantity}
      WHERE "branchid" = ${branchId} AND "ProductId" = ${productId}
      RETURNING *
    `;

    return NextResponse.json((updatedProduct as any[])[0]);
  } catch (error) {
    console.error("Error updating branch product:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی محصول شعبه" },
      { status: 500 }
    );
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
  const params = await props.params;
  try {
    const branchId = parseInt(params.branchId);
    const productId = parseInt(params.productId);

    // Check if branch product exists
    const branchProductResult = await prisma.$queryRaw`
      SELECT * FROM "support"."branchproduct"
      WHERE "branchid" = ${branchId} AND "ProductId" = ${productId}
    `;

    if ((branchProductResult as any[]).length === 0) {
      return NextResponse.json(
        { error: "محصول در این شعبه یافت نشد" },
        { status: 404 }
      );
    }

    // Delete branch product
    await prisma.$queryRaw`
      DELETE FROM "support"."branchproduct"
      WHERE "branchid" = ${branchId} AND "ProductId" = ${productId}
    `;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting branch product:", error);
    return NextResponse.json(
      { error: "خطا در حذف محصول از شعبه" },
      { status: 500 }
    );
  }
}
