import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const warehouseProduct = await prisma.warehouseproduct.create({
      data: {
        warehouseid: data.warehouseid,
        ProductId: data.ProductId,
        ProductGradeId: data.ProductGradeId,
        quantity: data.quantity || 0,
      },
      include: {
        Product: true,
        ProductGrade: true,
      },
    });
    return NextResponse.json(warehouseProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to add product to warehouse" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    const warehouseProduct = await prisma.warehouseproduct.update({
      where: {
        warehouseproductid: data.warehouseproductid,
      },
      data: {
        ProductGradeId: data.ProductGradeId,
        quantity: data.quantity,
      },
      include: {
        Product: true,
        ProductGrade: true,
      },
    });
    return NextResponse.json(warehouseProduct);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update warehouse product" }, { status: 500 });
  }
}
