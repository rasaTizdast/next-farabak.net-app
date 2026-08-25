import { NextResponse } from "next/server";

import { errorResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { branchProductQuerySchema, validateParams } from "@/lib/validation";

export const dynamic = "force-dynamic";

/**
 * GET handler for fetching branches that have stock of a specific product
 * Used for warranty assignment to only show branches with available products
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const queryResult = validateParams(Object.fromEntries(searchParams), branchProductQuerySchema);
  if ("error" in queryResult) return queryResult.error;
  const data = queryResult.data;

  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const userRole = auth.role;
  const productId = data.productId;

  // Only Admin or Branch users can see branches
  if (userRole !== "Admin" && userRole !== "Branch") {
    return errorResponse("دسترسی غیرمجاز", 403);
  }

  try {
    // Get branches that have stock of the specific product
    const branchesWithStock = await prisma.branchproduct.findMany({
      where: {
        ProductId: productId,
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
    return serverErrorResponse("خطا در بارگذاری لیست شعبه‌ها");
  }
}
