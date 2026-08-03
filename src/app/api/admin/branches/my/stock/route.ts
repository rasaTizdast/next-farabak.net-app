import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET handler for checking if the current branch has stock of a specific product
 * Used for warranty assignment within a branch
 */
export async function GET(request: Request) {
  try {
    // Get productId from URL
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "شناسه محصول الزامی است" }, { status: 400 });
    }

    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const userId = auth.userId;
    const userRole = auth.role;

    // Only Branch users can check their own stock
    if (userRole !== "Branch") {
      return NextResponse.json(
        { error: "این سرویس فقط برای کاربران شعبه قابل دسترسی است" },
        { status: 403 }
      );
    }

    // Get the branch associated with this user
    // Using a raw query to avoid model naming issues
    const branchStaffResult = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT branchid FROM branch_staff 
      WHERE userid = ${userId} 
      LIMIT 1
    `;

    if (!branchStaffResult || !Array.isArray(branchStaffResult) || branchStaffResult.length === 0) {
      return NextResponse.json({ error: "شما با هیچ شعبه‌ای مرتبط نیستید" }, { status: 404 });
    }

    const branchId = branchStaffResult[0].branchid as number;

    // Get branch details
    const branch = await prisma.branch.findUnique({
      where: {
        branchid: branchId,
      },
    });

    if (!branch) {
      return NextResponse.json({ error: "شعبه یافت نشد" }, { status: 404 });
    }

    // Check if the branch has the product in stock
    const productStock = await prisma.branchproduct.findFirst({
      where: {
        branchid: branchId,
        ProductId: parseInt(productId),
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
    return NextResponse.json({ error: "خطا در بررسی موجودی شعبه" }, { status: 500 });
  }
}
