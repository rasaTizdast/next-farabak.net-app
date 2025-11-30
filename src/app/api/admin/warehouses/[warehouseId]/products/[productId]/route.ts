import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  props: { params: Promise<{ warehouseId: string; productId: string }> }
) {
  const params = await props.params;
  try {
    const warehouseId = parseInt(params.warehouseId);
    const productId = parseInt(params.productId);
    const { quantity, ProductGradeId } = await request.json();

    if (quantity === undefined && ProductGradeId === undefined) {
      return NextResponse.json({ error: "تعداد یا گرید الزامی است" }, { status: 400 });
    }

    // First check if the warehouse product exists
    const existingProduct = await prisma.warehouseproduct.findUnique({
      where: {
        warehouseproductid: productId,
      },
      include: {
        Product: true,
      },
    });

    if (!existingProduct || existingProduct.warehouseid !== warehouseId) {
      return NextResponse.json({ error: "محصول در این انبار یافت نشد" }, { status: 404 });
    }

    // If updating grade, validate it exists for this product
    if (ProductGradeId !== undefined && ProductGradeId !== null) {
      const validGrade = await prisma.productGrade.findFirst({
        where: {
          ProductGradeId: ProductGradeId,
          ProductId: existingProduct.ProductId,
        },
      });

      if (!validGrade) {
        return NextResponse.json({ error: "گرید محصول معتبر نیست" }, { status: 400 });
      }
    }

    // Update using Prisma client
    const updated = await prisma.warehouseproduct.update({
      where: {
        warehouseproductid: productId,
      },
      data: {
        ...(quantity !== undefined && { quantity }),
        ...(ProductGradeId !== undefined && { ProductGradeId }),
      },
      include: {
        Product: {
          include: {
            ProductGrade: true,
          },
        },
        ProductGrade: true,
      },
    });
    // Format the response to match the expected structure
    const formattedProduct = {
      warehouseproductid: updated.warehouseproductid,
      ProductId: updated.ProductId,
      Type: updated.Product.Type,
      Name: updated.Product.Name,
      quantity: updated.quantity,
      ProductGradeId: updated.ProductGradeId,
      ProductGrade: updated.ProductGrade,
      availableGrades: updated.Product.ProductGrade,
    };

    return NextResponse.json(formattedProduct);
  } catch (error) {
    console.error("Error updating warehouse product:", error);
    return NextResponse.json({ error: "خطا در بروزرسانی محصول انبار" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ warehouseId: string; productId: string }> }
) {
  const params = await props.params;
  try {
    const warehouseId = parseInt(params.warehouseId);
    const productId = parseInt(params.productId);

    // Verify the warehouseproduct belongs to the warehouse
    const existing = await prisma.warehouseproduct.findUnique({
      where: { warehouseproductid: productId },
    });

    if (!existing || existing.warehouseid !== warehouseId) {
      return NextResponse.json({ error: "محصول در این انبار یافت نشد" }, { status: 404 });
    }

    const deleted = await prisma.warehouseproduct.delete({
      where: { warehouseproductid: productId },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Error removing product from warehouse:", error);
    return NextResponse.json({ error: "خطا در حذف محصول از انبار" }, { status: 500 });
  }
}
