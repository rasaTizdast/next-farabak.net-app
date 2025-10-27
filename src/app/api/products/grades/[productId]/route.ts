import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// PUT /api/products/grades/[gradeId] - Update a grade
export async function PUT(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const gradeId = parseInt(params.productId); // Using productId param as gradeId
    const { grade, price, discount } = await request.json();

    if (!grade || !price) {
      return NextResponse.json({ error: "Grade and price are required" }, { status: 400 });
    }

    // Check if another grade with the same letter exists for this product
    const existingGrade = await prisma.productGrade.findFirst({
      where: {
        ProductGradeId: {
          not: gradeId,
        },
        Grade: grade,
        Product: {
          ProductId: {
            equals:
              (
                await prisma.productGrade.findUnique({
                  where: { ProductGradeId: gradeId },
                  select: { ProductId: true },
                })
              )?.ProductId ?? undefined,
          },
        },
      },
    });

    if (existingGrade) {
      return NextResponse.json(
        { error: "A grade with this letter already exists for this product" },
        { status: 400 }
      );
    }

    const updatedGrade = await prisma.productGrade.update({
      where: { ProductGradeId: gradeId },
      data: {
        Grade: grade,
        Price: price,
        discount: discount || 0,
      },
    });

    return NextResponse.json(updatedGrade);
  } catch (error) {
    console.error("Error updating product grade:", error);
    return NextResponse.json({ error: "Failed to update product grade" }, { status: 500 });
  }
}

// DELETE /api/products/grades/[gradeId] - Delete a grade
export async function DELETE(_request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const gradeId = parseInt(params.productId); // Using productId param as gradeId

    await prisma.productGrade.delete({
      where: { ProductGradeId: gradeId },
    });

    return NextResponse.json({ message: "Grade deleted successfully" });
  } catch (error) {
    console.error("Error deleting product grade:", error);
    return NextResponse.json({ error: "Failed to delete product grade" }, { status: 500 });
  }
}
