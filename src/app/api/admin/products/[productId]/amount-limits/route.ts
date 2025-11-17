import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest, { params }: { params: { productId: string } }) {
  try {
    const { productId } = params;
    const body = await request.json();
    const { minimum_amount, maximum_amount } = body;

    // Validate product ID
    if (!productId || isNaN(Number(productId))) {
      return NextResponse.json({ message: "شناسه محصول نامعتبر است" }, { status: 400 });
    }

    // Validate amounts
    if (minimum_amount !== null && minimum_amount !== undefined) {
      if (typeof minimum_amount !== "number" || minimum_amount < 0) {
        return NextResponse.json({ message: "حداقل مقدار باید عدد مثبت باشد" }, { status: 400 });
      }
    }

    if (maximum_amount !== null && maximum_amount !== undefined) {
      if (typeof maximum_amount !== "number" || maximum_amount < 0) {
        return NextResponse.json({ message: "حداکثر مقدار باید عدد مثبت باشد" }, { status: 400 });
      }
    }

    if (minimum_amount !== null && maximum_amount !== null && minimum_amount > maximum_amount) {
      return NextResponse.json(
        { message: "حداقل مقدار نمی‌تواند بیشتر از حداکثر باشد" },
        { status: 400 }
      );
    }

    // TODO: Replace with your actual database query
    // Example with Prisma:
    const updatedProduct = await prisma.product.update({
      where: { ProductId: Number(productId) },
      data: {
        Minimum_Amount: minimum_amount,
        Maximum_Amount: maximum_amount,
      },
    });

    return NextResponse.json({
      message: "تغییرات با موفقیت ذخیره شد",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product amounts:", error);
    return NextResponse.json({ message: "خطای سرور در ذخیره تغییرات" }, { status: 500 });
  }
}
