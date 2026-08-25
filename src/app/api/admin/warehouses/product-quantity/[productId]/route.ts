import { NextResponse } from "next/server";

import { serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productIdParamSchema, validateParams } from "@/lib/validation";

export async function GET(request: Request, props: { params: Promise<{ productId: string }> }) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  try {
    const paramValidation = validateParams(params, productIdParamSchema);
    if ("error" in paramValidation) return paramValidation.error;
    const productId = paramValidation.data.productId;

    const result = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT COALESCE(SUM("quantity"), 0) as "totalQuantity"
      FROM "support"."warehouseproduct"
      WHERE "ProductId" = ${productId}
    `;

    const totalQuantity = (result[0]?.totalQuantity as number) || 0;
    return NextResponse.json({ productId, totalQuantity: Number(totalQuantity) });
  } catch (error) {
    console.error("Error getting product warehouse quantity:", error);
    return serverErrorResponse("خطا در دریافت تعداد محصول در انبارها");
  }
}
