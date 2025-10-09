import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request, props: { params: Promise<{ warehouseId: string }> }) {
  const params = await props.params;
  try {
    const id = parseInt(params.warehouseId);

    const result = await prisma.$queryRaw`
      SELECT w."warehouseid", w."name", w."location", w."createdat",
             COALESCE(COUNT(DISTINCT wp."ProductId"), 0)::integer as "productCount",
             COALESCE(SUM(wp."quantity"), 0)::integer as "totalQuantity"
      FROM "support"."warehouse" w
      LEFT JOIN "support"."warehouseproduct" wp ON w."warehouseid" = wp."warehouseid"
      WHERE w."warehouseid" = ${id}
      GROUP BY w."warehouseid", w."name", w."location", w."createdat"
    `;

    if ((result as any[]).length === 0) {
      return NextResponse.json({ error: "انبار یافت نشد" }, { status: 404 });
    }
    return NextResponse.json((result as any[])[0]);
  } catch (error) {
    console.error("Error fetching warehouse:", error);
    return NextResponse.json({ error: "خطا در دریافت انبار" }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ warehouseId: string }> }) {
  const params = await props.params;
  try {
    const id = parseInt(params.warehouseId);
    const { name, location } = await request.json();

    const updated = await prisma.$queryRaw`
      UPDATE "support"."warehouse"
      SET "name" = COALESCE(${name}, "name"),
          "location" = COALESCE(${location}, "location")
      WHERE "warehouseid" = ${id}
      RETURNING *
    `;

    if ((updated as any[]).length === 0) {
      return NextResponse.json({ error: "انبار یافت نشد" }, { status: 404 });
    }
    return NextResponse.json((updated as any[])[0]);
  } catch (error) {
    console.error("Error updating warehouse:", error);
    return NextResponse.json({ error: "خطا در بروزرسانی انبار" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ warehouseId: string }> }
) {
  const params = await props.params;
  try {
    const id = parseInt(params.warehouseId);
    // First, delete all warehouseproduct records for this warehouse
    await prisma.$queryRaw`
      DELETE FROM "support"."warehouseproduct"
      WHERE "warehouseid" = ${id}
    `;

    // Then, delete the warehouse itself
    const deleted = await prisma.$queryRaw`
      DELETE FROM "support"."warehouse"
      WHERE "warehouseid" = ${id}
      RETURNING *
    `;

    if ((deleted as any[]).length === 0) {
      return NextResponse.json({ error: "انبار یافت نشد" }, { status: 404 });
    }
    return NextResponse.json((deleted as any[])[0]);
  } catch (error) {
    console.error("Error deleting warehouse:", error);
    return NextResponse.json({ error: "خطا در حذف انبار" }, { status: 500 });
  }
}
