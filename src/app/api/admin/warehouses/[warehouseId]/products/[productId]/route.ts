import { NextResponse } from "next/server";

import { errorResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  productIdParamSchema,
  updateWarehouseProductSchema,
  validateBody,
  validateParams,
  warehouseIdParamSchema,
} from "@/lib/validation";

export async function PUT(
  request: Request,
  props: { params: Promise<{ warehouseId: string; productId: string }> }
) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  try {
    const warehouseParamValidation = validateParams(
      { warehouseId: params.warehouseId },
      warehouseIdParamSchema
    );
    if ("error" in warehouseParamValidation) return warehouseParamValidation.error;

    const productParamValidation = validateParams(
      { productId: params.productId },
      productIdParamSchema
    );
    if ("error" in productParamValidation) return productParamValidation.error;

    const warehouseId = warehouseParamValidation.data.warehouseId;
    const productId = productParamValidation.data.productId;

    const bodyValidation = await validateBody(request, updateWarehouseProductSchema);
    if ("error" in bodyValidation) return bodyValidation.error;

    const { quantity, ProductGradeId } = bodyValidation.data;

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
      return notFoundResponse("محصول در این انبار یافت نشد");
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
        return errorResponse("گرید محصول معتبر نیست", 400);
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
    return serverErrorResponse("خطا در بروزرسانی محصول انبار");
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ warehouseId: string; productId: string }> }
) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  try {
    const warehouseParamValidation = validateParams(
      { warehouseId: params.warehouseId },
      warehouseIdParamSchema
    );
    if ("error" in warehouseParamValidation) return warehouseParamValidation.error;

    const productParamValidation = validateParams(
      { productId: params.productId },
      productIdParamSchema
    );
    if ("error" in productParamValidation) return productParamValidation.error;

    const warehouseId = warehouseParamValidation.data.warehouseId;
    const productId = productParamValidation.data.productId;

    // Verify the warehouseproduct belongs to the warehouse
    const existing = await prisma.warehouseproduct.findUnique({
      where: { warehouseproductid: productId },
    });

    if (!existing || existing.warehouseid !== warehouseId) {
      return notFoundResponse("محصول در این انبار یافت نشد");
    }

    const deleted = await prisma.warehouseproduct.delete({
      where: { warehouseproductid: productId },
    });

    return NextResponse.json(deleted);
  } catch (error) {
    console.error("Error removing product from warehouse:", error);
    return serverErrorResponse("خطا در حذف محصول از انبار");
  }
}
