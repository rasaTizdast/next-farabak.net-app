import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// GET /api/products/grades - Get all grades for a product
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const grades = await prisma.productGrade.findMany({
      where: {
        ProductId: parseInt(productId),
      },
      orderBy: {
        Grade: "asc",
      },
    });

    return NextResponse.json(grades);
  } catch (error) {
    console.error("Error fetching product grades:", error);
    return NextResponse.json({ error: "Failed to fetch product grades" }, { status: 500 });
  }
}

// POST /api/products/grades - Create a new grade
export async function POST(request: NextRequest) {
  try {
    const { productId, grade, price, discount } = await request.json();

    if (!productId || !grade || !price) {
      return NextResponse.json(
        { error: "Product ID, grade, and price are required" },
        { status: 400 }
      );
    }

    // Check if grade already exists for this product
    const existingGrade = await prisma.productGrade.findFirst({
      where: {
        ProductId: productId,
        Grade: grade,
      },
    });

    if (existingGrade) {
      return NextResponse.json(
        { error: "A grade with this letter already exists for this product" },
        { status: 400 }
      );
    }

    const newGrade = await prisma.productGrade.create({
      data: {
        Product: {
          connect: { ProductId: productId },
        },
        Grade: grade,
        Price: price,
        discount: discount || 0,
      },
    });

    return NextResponse.json(newGrade, { status: 201 });
  } catch (error) {
    console.error("Error creating product grade:", error);
    return NextResponse.json({ error: "Failed to create product grade" }, { status: 500 });
  }
}
