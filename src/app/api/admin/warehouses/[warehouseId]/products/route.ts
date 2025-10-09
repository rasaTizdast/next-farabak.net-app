import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request, props: { params: Promise<{ warehouseId: string }> }) {
  const params = await props.params;
  try {
    const warehouseId = parseInt(params.warehouseId);

    const products = await prisma.$queryRaw`
      SELECT p."ProductId", p."Type", p."Name", COALESCE(wp."quantity", 0)::integer as "quantity"
      FROM "support"."Product" p
      INNER JOIN "support"."warehouseproduct" wp ON p."ProductId" = wp."ProductId"
      WHERE wp."warehouseid" = ${warehouseId}
      ORDER BY p."Type"
    `;

    return NextResponse.json(products);
  } catch (error) {
    console.error("Error fetching warehouse products:", error);
    return NextResponse.json({ error: "خطا در دریافت محصولات انبار" }, { status: 500 });
  }
}

export async function POST(request: Request, props: { params: Promise<{ warehouseId: string }> }) {
  const params = await props.params;
  try {
    const warehouseId = parseInt(params.warehouseId);
    const { productId, quantity } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: "شناسه محصول و تعداد الزامی است" }, { status: 400 });
    }

    const warehouseResult = await prisma.$queryRaw`
      SELECT * FROM "support"."warehouse" WHERE "warehouseid" = ${warehouseId}
    `;
    if ((warehouseResult as any[]).length === 0) {
      return NextResponse.json({ error: "انبار یافت نشد" }, { status: 404 });
    }

    const productResult = await prisma.$queryRaw`
      SELECT * FROM "support"."Product" WHERE "ProductId" = ${productId}
    `;
    if ((productResult as any[]).length === 0) {
      return NextResponse.json({ error: "محصول یافت نشد" }, { status: 404 });
    }

    const existing = await prisma.$queryRaw`
      SELECT * FROM "support"."warehouseproduct"
      WHERE "warehouseid" = ${warehouseId} AND "ProductId" = ${productId}
    `;

    if ((existing as any[]).length > 0) {
      const updated = await prisma.$queryRaw`
        UPDATE "support"."warehouseproduct"
        SET "quantity" = "quantity" + ${quantity}
        WHERE "warehouseid" = ${warehouseId} AND "ProductId" = ${productId}
        RETURNING *
      `;
      return NextResponse.json((updated as any[])[0], { status: 200 });
    }

    const inserted = await prisma.$queryRaw`
      INSERT INTO "support"."warehouseproduct" ("warehouseid", "ProductId", "quantity")
      VALUES (${warehouseId}, ${productId}, ${quantity})
      RETURNING *
    `;
    return NextResponse.json((inserted as any[])[0], { status: 201 });
  } catch (error) {
    console.error("Error adding product to warehouse:", error);
    return NextResponse.json({ error: "خطا در افزودن محصول به انبار" }, { status: 500 });
  }
}
