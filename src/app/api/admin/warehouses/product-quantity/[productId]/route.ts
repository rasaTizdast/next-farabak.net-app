import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, props: { params: Promise<{ productId: string }> }) {
  const params = await props.params;
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    const productId = parseInt(params.productId);

    const result = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT COALESCE(SUM("quantity"), 0) as "totalQuantity"
      FROM "support"."warehouseproduct"
      WHERE "ProductId" = ${productId}
    `;

    const totalQuantity = (result[0]?.totalQuantity as number) || 0;
    return NextResponse.json({ productId, totalQuantity: Number(totalQuantity) });
  } catch (error) {
    console.error("Error getting product warehouse quantity:", error);
    return NextResponse.json({ error: "خطا در دریافت تعداد محصول در انبارها" }, { status: 500 });
  }
}
