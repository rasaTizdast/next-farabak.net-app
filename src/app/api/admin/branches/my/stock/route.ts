import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

export const dynamic = "force-dynamic";

// Helper function to verify the JWT token
async function verifyToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

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

    // Verify authentication
    const tokenPayload = await verifyToken();

    if (!tokenPayload) {
      return NextResponse.json({ error: "احراز هویت الزامی است" }, { status: 401 });
    }

    // Get user info from token
    const userId = tokenPayload.id;
    const userRole = tokenPayload.role;

    // Only Branch users can check their own stock
    if (userRole !== "Branch") {
      return NextResponse.json(
        { error: "این سرویس فقط برای کاربران شعبه قابل دسترسی است" },
        { status: 403 }
      );
    }

    // Get the branch associated with this user
    // Using a raw query to avoid model naming issues
    const branchStaffResult = await prisma.$queryRaw`
      SELECT branchid FROM branch_staff 
      WHERE userid = ${userId} 
      LIMIT 1
    `;

    if (!branchStaffResult || !Array.isArray(branchStaffResult) || branchStaffResult.length === 0) {
      return NextResponse.json({ error: "شما با هیچ شعبه‌ای مرتبط نیستید" }, { status: 404 });
    }

    const branchId = branchStaffResult[0].branchid;

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
