import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const offset = (page - 1) * limit;
    const q = searchParams.get("q");
    const productId = searchParams.get("productId");

    let countResult: unknown[];
    if (productId) {
      countResult = (await prisma.$queryRaw`
        SELECT COUNT(DISTINCT w."warehouseid")::integer as total
        FROM "support"."warehouse" w
        INNER JOIN "support"."warehouseproduct" wp ON w."warehouseid" = wp."warehouseid"
        WHERE wp."ProductId" = ${parseInt(productId)}
      `) as unknown[];
    } else if (q) {
      const like = `%${q.toLowerCase()}%`;
      countResult = (await prisma.$queryRaw`
        SELECT COUNT(*)::integer as total
        FROM "support"."warehouse"
        WHERE LOWER("name") LIKE ${like}
      `) as unknown[];
    } else {
      countResult = (await prisma.$queryRaw`
        SELECT COUNT(*)::integer as total
        FROM "support"."warehouse"
      `) as unknown[];
    }

    const total = Number((countResult as any[])[0]?.total || 0);

    let items: unknown[];
    if (productId) {
      items = (await prisma.$queryRaw`
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
      `) as unknown[];
    } else if (q) {
      const like = `%${q.toLowerCase()}%`;
      items = (await prisma.$queryRaw`
        SELECT w."warehouseid", w."name", w."location", w."createdat",
               COALESCE(COUNT(DISTINCT wp."ProductId"), 0)::integer as "productCount",
               COALESCE(SUM(wp."quantity"), 0)::integer as "totalQuantity"
        FROM "support"."warehouse" w
        LEFT JOIN "support"."warehouseproduct" wp ON w."warehouseid" = wp."warehouseid"
        WHERE LOWER(w."name") LIKE ${like}
        GROUP BY w."warehouseid", w."name", w."location", w."createdat"
        ORDER BY w."createdat" DESC
        LIMIT ${limit} OFFSET ${offset}
      `) as unknown[];
    } else {
      items = (await prisma.$queryRaw`
        SELECT w."warehouseid", w."name", w."location", w."createdat",
               COALESCE(COUNT(DISTINCT wp."ProductId"), 0)::integer as "productCount",
               COALESCE(SUM(wp."quantity"), 0)::integer as "totalQuantity"
        FROM "support"."warehouse" w
        LEFT JOIN "support"."warehouseproduct" wp ON w."warehouseid" = wp."warehouseid"
        GROUP BY w."warehouseid", w."name", w."location", w."createdat"
        ORDER BY w."createdat" DESC
        LIMIT ${limit} OFFSET ${offset}
      `) as unknown[];
    }

    return NextResponse.json({ items, total, page, limit });
  } catch (error) {
    console.error("Error fetching warehouses:", error);
    return NextResponse.json({ error: "خطا در دریافت انبارها" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, location } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "نام انبار الزامی است" }, { status: 400 });
    }

    // Check if warehouse name already exists
    const existingWarehouse = await prisma.$queryRaw`
      SELECT "warehouseid" FROM "support"."warehouse" 
      WHERE LOWER("name") = LOWER(${name})
    `;

    if ((existingWarehouse as any[]).length > 0) {
      return NextResponse.json(
        { error: "نام انبار تکراری است. لطفاً نام دیگری انتخاب کنید." },
        { status: 409 }
      );
    }

    const created = await prisma.$queryRaw`
      INSERT INTO "support"."warehouse" ("name", "location")
      VALUES (${name}, ${location || null})
      RETURNING *
    `;

    return NextResponse.json((created as any[])[0], { status: 201 });
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
