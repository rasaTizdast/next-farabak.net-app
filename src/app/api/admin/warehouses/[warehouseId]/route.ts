import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, props: { params: Promise<{ warehouseId: string }> }) {
  const params = await props.params;
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    const id = parseInt(params.warehouseId);

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
      return NextResponse.json({ error: "انبار یافت نشد" }, { status: 404 });
    }
    return NextResponse.json(result[0]);
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    return NextResponse.json({ error: "خطا در دریافت انبار" }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ warehouseId: string }> }) {
  const params = await props.params;
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    const id = parseInt(params.warehouseId);
    const { name, location } = await request.json();

    // If name is being updated, check for duplicates
    if (name) {
      const existingWarehouse = await prisma.$queryRaw<Record<string, unknown>[]>`
        SELECT "warehouseid" FROM "support"."warehouse" 
        WHERE LOWER("name") = LOWER(${name}) AND "warehouseid" != ${id}
      `;

      if (existingWarehouse.length > 0) {
        return NextResponse.json(
          { error: "نام انبار تکراری است. لطفاً نام دیگری انتخاب کنید." },
          { status: 409 }
        );
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
      return NextResponse.json({ error: "انبار یافت نشد" }, { status: 404 });
    }
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating warehouse:", error);

    // Handle unique constraint violation at database level as fallback
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        { error: "نام انبار تکراری است. لطفاً نام دیگری انتخاب کنید." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "خطا در بروزرسانی انبار" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ warehouseId: string }> }
) {
  const params = await props.params;
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    const id = parseInt(params.warehouseId);
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
      return NextResponse.json({ error: "انبار یافت نشد" }, { status: 404 });
    }
    return NextResponse.json(deleted[0]);
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return NextResponse.json({ error: "خطا در حذف انبار" }, { status: 500 });
  }
}
