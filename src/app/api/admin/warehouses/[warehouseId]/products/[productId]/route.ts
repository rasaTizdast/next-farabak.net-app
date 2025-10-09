import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  props: { params: Promise<{ warehouseId: string; productId: string }> }
) {
  const params = await props.params;
  try {
    const warehouseId = parseInt(params.warehouseId);
    const productId = parseInt(params.productId);
    const { quantity } = await request.json();

    if (quantity === undefined) {
      return NextResponse.json({ error: "تعداد الزامی است" }, { status: 400 });
    }

    const existing = await prisma.$queryRaw`
      SELECT * FROM "support"."warehouseproduct"
      WHERE "warehouseid" = ${warehouseId} AND "ProductId" = ${productId}
    `;

    if ((existing as any[]).length === 0) {
      return NextResponse.json({ error: "محصول در این انبار یافت نشد" }, { status: 404 });
    }

    const updated = await prisma.$queryRaw`
      UPDATE "support"."warehouseproduct"
      SET "quantity" = ${quantity}
      WHERE "warehouseid" = ${warehouseId} AND "ProductId" = ${productId}
      RETURNING *
    `;
    return NextResponse.json((updated as any[])[0]);
  } catch (error) {
    console.error("Error updating warehouse product:", error);
    return NextResponse.json({ error: "خطا در بروزرسانی محصول انبار" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ warehouseId: string; productId: string }> }
) {
  const params = await props.params;
  try {
    const warehouseId = parseInt(params.warehouseId);
    const productId = parseInt(params.productId);

    const deleted = await prisma.$queryRaw`
      DELETE FROM "support"."warehouseproduct"
      WHERE "warehouseid" = ${warehouseId} AND "ProductId" = ${productId}
      RETURNING *
    `;

    if ((deleted as any[]).length === 0) {
      return NextResponse.json({ error: "محصول در این انبار یافت نشد" }, { status: 404 });
    }
    return NextResponse.json((deleted as any[])[0]);
  } catch (error) {
    console.error("Error removing product from warehouse:", error);
    return NextResponse.json({ error: "خطا در حذف محصول از انبار" }, { status: 500 });
  }
}
