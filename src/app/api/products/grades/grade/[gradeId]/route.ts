import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// PUT /api/products/grades/grade/[gradeId] - Update a specific grade
export async function PUT(request: NextRequest, context: { params: { gradeId: string } }) {
  try {
    const { params } = context;
    const gradeId = parseInt(params.gradeId);
    const { grade, price, discount } = await request.json();

    if (!grade || !price) {
      return NextResponse.json({ error: "Grade and price are required" }, { status: 400 });
    }

    // Get the grade's product ID first
    const currentGrade = await prisma.productGrade.findUnique({
      where: { ProductGradeId: gradeId },
      select: { ProductId: true },
    });

    if (!currentGrade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    // Check if another grade with the same letter exists for this product
    const existingGrade = await prisma.productGrade.findFirst({
      where: {
        ProductGradeId: { not: gradeId },
        Grade: grade.toUpperCase(),
        ProductId: currentGrade.ProductId,
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
        Grade: grade.toUpperCase(),
        Price: Number(price),
        discount: Number(discount || 0),
      },
    });

    return NextResponse.json(updatedGrade);
  } catch (error) {
    console.error("Error updating product grade:", error);
    return NextResponse.json({ error: "Failed to update product grade" }, { status: 500 });
  }
}

// DELETE /api/products/grades/grade/[gradeId] - Delete a specific grade
export async function DELETE(_request: NextRequest, context: { params: { gradeId: string } }) {
  try {
    const { params } = context;
    const gradeId = parseInt(params.gradeId);

    // Check if grade exists
    const grade = await prisma.productGrade.findUnique({
      where: { ProductGradeId: gradeId },
    });

    if (!grade) {
      return NextResponse.json({ error: "Grade not found" }, { status: 404 });
    }

    await prisma.productGrade.delete({
      where: { ProductGradeId: gradeId },
    });

    return NextResponse.json({ message: "Grade deleted successfully" });
  } catch (error) {
    console.error("Error deleting product grade:", error);
    return NextResponse.json({ error: "Failed to delete product grade" }, { status: 500 });
  }
}
