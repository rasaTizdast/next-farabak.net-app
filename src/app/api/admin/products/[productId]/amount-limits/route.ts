import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { TAGS } from "@/lib/data/tags";
import { prisma } from "@/lib/prisma";
import {
  validateParams,
  validateBody,
  productIdParamSchema,
  amountLimitsSchema,
} from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ productId: string }> }
) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  try {
    // Validate product ID
    const paramResult = validateParams(params, productIdParamSchema);
    if ("error" in paramResult) return paramResult.error;
    const productId = paramResult.data.productId;

    // Validate the request body
    const result = await validateBody(request, amountLimitsSchema);
    if ("error" in result) return result.error;
    const data = result.data;

    // TODO: Replace with your actual database query
    // Example with Prisma:
    const updatedProduct = await prisma.product.update({
      where: { ProductId: productId },
      data: {
        Minimum_Amount: data.minimum_amount,
        Maximum_Amount: data.maximum_amount,
      },
    });

    revalidateTag(TAGS.products, "max");
    revalidateTag(TAGS.categories, "max");
    return NextResponse.json({
      message: "تغییرات با موفقیت ذخیره شد",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product amounts:", error);
    return serverErrorResponse("خطای سرور در ذخیره تغییرات");
  }
}
