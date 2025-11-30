import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request, props: { params: Promise<{ warehouseId: string }> }) {
  const params = await props.params;
  try {
    const warehouseId = parseInt(params.warehouseId);

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
    return NextResponse.json({ error: "خطا در دریافت محصولات انبار" }, { status: 500 });
  }
}

export async function POST(request: Request, props: { params: Promise<{ warehouseId: string }> }) {
  const params = await props.params;
  try {
    const warehouseId = parseInt(params.warehouseId);
    const { productId, quantity, ProductGradeId } = await request.json();

    if (!productId || quantity === undefined) {
      return NextResponse.json({ error: "شناسه محصول و تعداد الزامی است" }, { status: 400 });
    }

    if (ProductGradeId) {
      const gradeResult = await prisma.$queryRaw`
        SELECT * FROM "support"."ProductGrade" 
        WHERE "ProductGradeId" = ${ProductGradeId} 
        AND "ProductId" = ${productId}
      `;
      if ((gradeResult as any[]).length === 0) {
        return NextResponse.json({ error: "گرید محصول معتبر نیست" }, { status: 400 });
      }
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
      WHERE "warehouseid" = ${warehouseId} 
      AND "ProductId" = ${productId}
      AND (
        ("ProductGradeId" IS NULL AND ${ProductGradeId}::text = 'null')
        OR
        "ProductGradeId" = CASE WHEN ${ProductGradeId}::text = 'null' THEN NULL ELSE ${ProductGradeId}::int END
      )
    `;

    if ((existing as any[]).length > 0) {
      const updated = await prisma.$queryRaw`
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
      return NextResponse.json((updated as any[])[0], { status: 200 });
    }

    const inserted = await prisma.$queryRaw`
      INSERT INTO "support"."warehouseproduct" ("warehouseid", "ProductId", "quantity", "ProductGradeId")
      VALUES (
        ${warehouseId}, 
        ${productId}, 
        ${quantity}, 
        CASE WHEN ${ProductGradeId}::text = 'null' THEN NULL ELSE ${ProductGradeId}::int END
      )
      RETURNING *
    `;
    return NextResponse.json((inserted as any[])[0], { status: 201 });
  } catch (error) {
    console.error("Error adding product to warehouse:", error);
    return NextResponse.json({ error: "خطا در افزودن محصول به انبار" }, { status: 500 });
  }
}
