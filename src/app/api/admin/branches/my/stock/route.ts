import { NextResponse } from "next/server";

import { errorResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { branchProductQuerySchema, validateParams } from "@/lib/validation";

/**
 * GET handler for checking if the current branch has stock of a specific product
 * Used for warranty assignment within a branch
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryResult = validateParams(Object.fromEntries(searchParams), branchProductQuerySchema);
  if ("error" in queryResult) return queryResult.error;
  const data = queryResult.data;

  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const userId = auth.userId;
  const userRole = auth.role;
  const productId = data.productId;

  // Only Branch users can check their own stock
  if (userRole !== "Branch") {
    return errorResponse("این سرویس فقط برای کاربران شعبه قابل دسترسی است", 403);
  }

  try {
    // Get the branch associated with this user
    // Using a raw query to avoid model naming issues
    const branchStaffResult = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT branchid FROM branch_staff 
      WHERE userid = ${userId} 
      LIMIT 1
    `;

    if (!branchStaffResult || !Array.isArray(branchStaffResult) || branchStaffResult.length === 0) {
      return notFoundResponse("شما با هیچ شعبه‌ای مرتبط نیستید");
    }

    const branchId = branchStaffResult[0].branchid as number;

    // Get branch details
    const branch = await prisma.branch.findUnique({
      where: {
        branchid: branchId,
      },
    });

    if (!branch) {
      return notFoundResponse("شعبه یافت نشد");
    }

    // Check if the branch has the product in stock
    const productStock = await prisma.branchproduct.findFirst({
      where: {
        branchid: branchId,
        ProductId: productId,
      },
    });

    // Return branch info with stock status
    return NextResponse.json({
      branchid: branchId,
      name: branch.name,
      location: branch.location,
      hasStock:
        productStock !== null && productStock.quantity !== null && productStock.quantity > 0,
      quantity: productStock?.quantity || 0,
    });
  } catch (error) {
    console.error("Error checking branch stock:", error);
    return serverErrorResponse("خطا در بررسی موجودی شعبه");
  }
}
