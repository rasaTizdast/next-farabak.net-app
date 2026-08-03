import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    // Cleanup invalid warehouseproduct records where ProductGradeId is not null and invalid
    await prisma.$queryRaw<Record<string, unknown>[]>`
      DELETE FROM "support"."warehouseproduct"
      WHERE "ProductGradeId" IS NOT NULL
      AND "ProductGradeId" NOT IN (SELECT "ProductGradeId" FROM "support"."ProductGrade")
    `;

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const q = searchParams.get("q");
    const productId = searchParams.get("productId");

    let countResult: Record<string, unknown>[];
    if (productId) {
      countResult = await prisma.$queryRaw<Record<string, unknown>[]>`
        SELECT COUNT(DISTINCT w."warehouseid")::integer as total
        FROM "support"."warehouse" w
        INNER JOIN "support"."warehouseproduct" wp ON w."warehouseid" = wp."warehouseid"
        WHERE wp."ProductId" = ${parseInt(productId)}
      `;
    } else if (q) {
      const like = `%${q.toLowerCase()}%`;
      countResult = await prisma.$queryRaw<Record<string, unknown>[]>`
        SELECT COUNT(*)::integer as total
        FROM "support"."warehouse"
        WHERE LOWER("name") LIKE ${like}
      `;
    } else {
      countResult = await prisma.$queryRaw<Record<string, unknown>[]>`
        SELECT COUNT(*)::integer as total
        FROM "support"."warehouse"
      `;
    }

    const total = Number(countResult[0]?.total || 0);

    let items: Record<string, unknown>[];
    if (productId) {
      items = await prisma.$queryRaw<Record<string, unknown>[]>`
        SELECT w."warehouseid", w."name", w."location", w."createdat",
               COUNT(DISTINCT wp2."ProductId")::integer as "productCount",
               COALESCE(wp1."quantity", 0)::integer as "productQuantity",
               COALESCE(SUM(wp2."quantity"), 0)::integer as "totalQuantity"
        FROM "support"."warehouse" w
        INNER JOIN "support"."warehouseproduct" wp1 ON w."warehouseid" = wp1."warehouseid" AND wp1."ProductId" = ${parseInt(productId)}
        LEFT JOIN "support"."warehouseproduct" wp2 ON w."warehouseid" = wp2."warehouseid"
        GROUP BY w."warehouseid", w."name", w."location", w."createdat", wp1."quantity"
        ORDER BY wp1."quantity" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else if (q) {
      const like = `%${q.toLowerCase()}%`;
      items = await prisma.$queryRaw<Record<string, unknown>[]>`
        SELECT w."warehouseid", w."name", w."location", w."createdat",
               COALESCE(COUNT(DISTINCT wp."ProductId"), 0)::integer as "productCount",
               COALESCE(SUM(wp."quantity"), 0)::integer as "totalQuantity"
        FROM "support"."warehouse" w
        LEFT JOIN "support"."warehouseproduct" wp ON w."warehouseid" = wp."warehouseid"
        WHERE LOWER(w."name") LIKE ${like}
        GROUP BY w."warehouseid", w."name", w."location", w."createdat"
        ORDER BY w."createdat" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } else {
      items = await prisma.$queryRaw<Record<string, unknown>[]>`
        SELECT w."warehouseid", w."name", w."location", w."createdat",
               COALESCE(COUNT(DISTINCT wp."ProductId"), 0)::integer as "productCount",
               COALESCE(SUM(wp."quantity"), 0)::integer as "totalQuantity"
        FROM "support"."warehouse" w
        LEFT JOIN "support"."warehouseproduct" wp ON w."warehouseid" = wp."warehouseid"
        GROUP BY w."warehouseid", w."name", w."location", w."createdat"
        ORDER BY w."createdat" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    }

    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return NextResponse.json({ error: "خطا در دریافت انبارها" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    const { name, location } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "نام انبار الزامی است" }, { status: 400 });
    }

    // Check if warehouse name already exists
    const existingWarehouse = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT "warehouseid" FROM "support"."warehouse"
      WHERE LOWER("name") = LOWER(${name})
    `;

    if (existingWarehouse.length > 0) {
      return NextResponse.json(
        { error: "نام انبار تکراری است. لطفاً نام دیگری انتخاب کنید." },
        { status: 409 }
      );
    }

    const created = await prisma.$queryRaw<Record<string, unknown>[]>`
      INSERT INTO "support"."warehouse" ("name", "location")
      VALUES (${name}, ${location || null})
      RETURNING *
    `;

    return NextResponse.json(created[0], { status: 201 });
  } catch (error) {
    console.error("Error creating warehouse:", error);

    // Handle unique constraint violation at database level as fallback
    if (error instanceof Error && error.message.includes("unique")) {
      return NextResponse.json(
        { error: "نام انبار تکراری است. لطفاً نام دیگری انتخاب کنید." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "خطا در ایجاد انبار" }, { status: 500 });
  }
}
