import { NextResponse } from "next/server";

import { errorResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  updateWarehouseSchema,
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
    const id = paramValidation.data.warehouseId;

    const result = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT w."warehouseid", w."name", w."location", w."createdat",
             COALESCE(COUNT(DISTINCT wp."ProductId"), 0)::integer as "productCount",
             COALESCE(SUM(wp."quantity"), 0)::integer as "totalQuantity"
      FROM "support"."warehouse" w
      LEFT JOIN "support"."warehouseproduct" wp ON w."warehouseid" = wp."warehouseid"
      WHERE w."warehouseid" = ${id}
      GROUP BY w."warehouseid", w."name", w."location", w."createdat"
    `;

    if (result.length === 0) {
      return notFoundResponse("انبار یافت نشد");
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    return serverErrorResponse("خطا در دریافت انبار");
  }
}

export async function PUT(request: Request, props: { params: Promise<{ warehouseId: string }> }) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  try {
    const paramValidation = validateParams(params, warehouseIdParamSchema);
    if ("error" in paramValidation) return paramValidation.error;
    const id = paramValidation.data.warehouseId;

    const bodyValidation = await validateBody(request, updateWarehouseSchema);
    if ("error" in bodyValidation) return bodyValidation.error;

    const { name, location } = bodyValidation.data;

    // If name is being updated, check for duplicates
    if (name) {
      const existingWarehouse = await prisma.$queryRaw<Record<string, unknown>[]>`
        SELECT "warehouseid" FROM "support"."warehouse" 
        WHERE LOWER("name") = LOWER(${name}) AND "warehouseid" != ${id}
      `;

      if (existingWarehouse.length > 0) {
        return errorResponse("نام انبار تکراری است. لطفاً نام دیگری انتخاب کنید.", 409);
      }
    }

    const updated = await prisma.$queryRaw<Record<string, unknown>[]>`
      UPDATE "support"."warehouse"
      SET "name" = COALESCE(${name}, "name"),
          "location" = COALESCE(${location}, "location")
      WHERE "warehouseid" = ${id}
      RETURNING *
    `;

    if (updated.length === 0) {
      return notFoundResponse("انبار یافت نشد");
    }
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating warehouse:", error);

    // Handle unique constraint violation at database level as fallback
    if (error instanceof Error && error.message.includes("unique")) {
      return errorResponse("نام انبار تکراری است. لطفاً نام دیگری انتخاب کنید.", 409);
    }

    return serverErrorResponse("خطا در بروزرسانی انبار");
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ warehouseId: string }> }
) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  try {
    const paramValidation = validateParams(params, warehouseIdParamSchema);
    if ("error" in paramValidation) return paramValidation.error;
    const id = paramValidation.data.warehouseId;
    // First, delete all warehouseproduct records for this warehouse
    await prisma.$queryRaw<Record<string, unknown>[]>`
      DELETE FROM "support"."warehouseproduct"
      WHERE "warehouseid" = ${id}
    `;

    // Then, delete the warehouse itself
    const deleted = await prisma.$queryRaw<Record<string, unknown>[]>`
      DELETE FROM "support"."warehouse"
      WHERE "warehouseid" = ${id}
      RETURNING *
    `;

    if (deleted.length === 0) {
      return notFoundResponse("انبار یافت نشد");
    }
    return NextResponse.json(deleted[0]);
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return serverErrorResponse("خطا در حذف انبار");
  }
}
