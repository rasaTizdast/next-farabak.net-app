import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import based on your Prisma setup

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Delete the showcase product from the database
    await prisma.showcase_products.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "محصول نمایشی با موفقیت حذف شد." });
  } catch (error) {
    return NextResponse.json(
      { error: "خطا در حذف محصول نمایشی." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const data = await request.json();
    
    // Update the showcase product in the database
    const updatedProduct = await prisma.showcase_products.update({
      where: { id: parseInt(id) },
      data: {
        order: data.order,
        // Can add other updatable fields here if needed
      },
    });

    return NextResponse.json(updatedProduct);
  } catch (error) {
    return NextResponse.json(
      { error: "خطا در بروزرسانی محصول نمایشی." },
      { status: 500 }
    );
  }
}
