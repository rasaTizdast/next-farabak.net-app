import { NextResponse } from "next/server";

import { errorResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  assignWarehouseProductSchema,
  validateBody,
  validateParams,
  warehouseIdParamSchema,
} from "@/lib/validation";

export async function GET(request: Request, props: { params: Promise<{ warehouseId: string }> }) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  try {
    const paramValidation = validateParams(params, warehouseIdParamSchema);
    if ("error" in paramValidation) return paramValidation.error;
    const warehouseId = paramValidation.data.warehouseId;

    const products = await prisma.warehouseproduct.findMany({
      where: {
        warehouseid: warehouseId,
      },
      include: {
        Product: {
          include: {
            ProductGrade: true,
          },
        },
        ProductGrade: true,
      },
      orderBy: {
        Product: {
          Type: "asc",
        },
      },
    });

    const formattedProducts = products.map((product) => ({
      warehouseproductid: product.warehouseproductid, // Include the unique identifier
      ProductId: product.ProductId,
      Type: product.Product.Type,
      Name: product.Product.Name,
      quantity: product.quantity || 0,
      ProductGradeId: product.ProductGradeId,
      ProductGrade: product.ProductGrade,
      availableGrades: product.Product.ProductGrade,
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("Error fetching warehouse products:", error);
    return serverErrorResponse("خطا در دریافت محصولات انبار");
  }
}

export async function POST(request: Request, props: { params: Promise<{ warehouseId: string }> }) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  try {
    const paramValidation = validateParams(params, warehouseIdParamSchema);
    if ("error" in paramValidation) return paramValidation.error;
    const warehouseId = paramValidation.data.warehouseId;

    const bodyValidation = await validateBody(request, assignWarehouseProductSchema);
    if ("error" in bodyValidation) return bodyValidation.error;

    const { productId, quantity, ProductGradeId } = bodyValidation.data;

    if (ProductGradeId) {
      const gradeResult = await prisma.$queryRaw<Record<string, unknown>[]>`
        SELECT * FROM "support"."ProductGrade" 
        WHERE "ProductGradeId" = ${ProductGradeId} 
        AND "ProductId" = ${productId}
      `;
      if (gradeResult.length === 0) {
        return errorResponse("گرید محصول معتبر نیست", 400);
      }
    }

    const warehouseResult = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM "support"."warehouse" WHERE "warehouseid" = ${warehouseId}
    `;
    if (warehouseResult.length === 0) {
      return notFoundResponse("انبار یافت نشد");
    }

    const productResult = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM "support"."Product" WHERE "ProductId" = ${productId}
    `;
    if (productResult.length === 0) {
      return notFoundResponse("محصول یافت نشد");
    }

    const existing = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM "support"."warehouseproduct"
      WHERE "warehouseid" = ${warehouseId} 
      AND "ProductId" = ${productId}
      AND (
        ("ProductGradeId" IS NULL AND ${ProductGradeId}::text = 'null')
        OR
        "ProductGradeId" = CASE WHEN ${ProductGradeId}::text = 'null' THEN NULL ELSE ${ProductGradeId}::int END
      )
    `;

    if (existing.length > 0) {
      const updated = await prisma.$queryRaw<Record<string, unknown>[]>`
        UPDATE "support"."warehouseproduct"
        SET "quantity" = "quantity" + ${quantity}
        WHERE "warehouseid" = ${warehouseId} 
        AND "ProductId" = ${productId}
        AND (
          ("ProductGradeId" IS NULL AND ${ProductGradeId}::text = 'null')
          OR
          "ProductGradeId" = CASE WHEN ${ProductGradeId}::text = 'null' THEN NULL ELSE ${ProductGradeId}::int END
        )
        RETURNING *
      `;
      return NextResponse.json(updated[0], { status: 200 });
    }

    const inserted = await prisma.$queryRaw<Record<string, unknown>[]>`
      INSERT INTO "support"."warehouseproduct" ("warehouseid", "ProductId", "quantity", "ProductGradeId")
      VALUES (
        ${warehouseId}, 
        ${productId}, 
        ${quantity}, 
        CASE WHEN ${ProductGradeId}::text = 'null' THEN NULL ELSE ${ProductGradeId}::int END
      )
      RETURNING *
    `;
    return NextResponse.json(inserted[0], { status: 201 });
  } catch (error) {
    console.error("Error adding product to warehouse:", error);
    return serverErrorResponse("خطا در افزودن محصول به انبار");
  }
}
