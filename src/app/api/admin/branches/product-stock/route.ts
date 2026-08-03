import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET handler for fetching branches that have stock of a specific product
 * Used for warranty assignment to only show branches with available products
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

    const userRole = auth.role;

    // Only Admin or Branch users can see branches
    if (userRole !== "Admin" && userRole !== "Branch") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    // Get branches that have stock of the specific product
    const branchesWithStock = await prisma.branchproduct.findMany({
      where: {
        ProductId: parseInt(productId),
      },
      select: {
        branch: {
          select: {
            branchid: true,
            name: true,
            location: true,
          },
        },
        quantity: true,
      },
    });

    // Transform data to match the expected format
    const formattedBranches = branchesWithStock.map((item) => ({
      branchid: item.branch.branchid,
      name: item.branch.name,
      location: item.branch.location,
      quantity: item.quantity,
    }));

    return NextResponse.json(formattedBranches);
  } catch (error) {
    console.error("Error fetching branches with product stock:", error);
    return NextResponse.json({ error: "خطا در بارگذاری لیست شعبه‌ها" }, { status: 500 });
  }
}
