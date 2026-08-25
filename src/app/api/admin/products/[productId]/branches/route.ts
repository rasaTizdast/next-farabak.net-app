import { NextResponse } from "next/server";

import { errorResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateParams, productIdParamSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(request: Request, props: { params: Promise<{ productId: string }> }) {
  const params = await props.params;
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const userRole = auth.role;
    const userId = auth.userId;

    // Only Admin or Branch users can search branches
    if (userRole !== "Admin" && userRole !== "Branch") {
      return errorResponse("دسترسی غیرمجاز", 403);
    }

    // Get product ID from params
    const paramResult = validateParams(params, productIdParamSchema);
    if ("error" in paramResult) return paramResult.error;
    const productId = paramResult.data.productId;

    // For branch users, get their branch ID
    let currentBranchId: number | undefined = undefined;
    if (userRole === "Branch") {
      const userBranch = await prisma.client.findUnique({
        where: { UserID: Number(userId) },
        include: { branch: true },
      });

      if (userBranch && userBranch.branch && userBranch.branch.length > 0) {
        currentBranchId = userBranch.branch[0].branchid;
      }
    }

    // Find all branches that have this product in stock (quantity > 0)
    // Exclude the current user's branch
    const branchProducts = await prisma.branchproduct.findMany({
      where: {
        ProductId: productId,
        quantity: {
          gt: 0,
        },
        ...(currentBranchId ? { branchid: { not: currentBranchId } } : {}),
      },
      include: {
        branch: true,
        Product: {
          select: {
            Type: true,
          },
        },
      },
    });

    // Format the response
    const formattedBranches = branchProducts.map((bp) => ({
      branchid: bp.branchid,
      branchName: bp.branch.name,
      location: bp.branch.location,
      ProductId: bp.ProductId,
      ProductType: bp.Product.Type,
      quantity: bp.quantity,
    }));

    return NextResponse.json({
      branches: formattedBranches,
    });
  } catch (error) {
    console.error("Error searching branches for product:", error);
    return serverErrorResponse("خطا در جستجوی شعبه‌ها");
  }
}
