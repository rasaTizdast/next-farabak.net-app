import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

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

export async function GET(request: Request, props: { params: Promise<{ productId: string }> }) {
  const params = await props.params;
  try {
    // Verify authentication
    const tokenPayload = await verifyToken();

    if (!tokenPayload) {
      return NextResponse.json(
        { error: "احراز هویت الزامی است" },
        { status: 401 }
      );
    }

    // Get user role and ID from token
    const userRole = tokenPayload.role;
    const userId = tokenPayload.sub;

    // Only Admin or Branch users can search branches
    if (userRole !== "Admin" && userRole !== "Branch") {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    // Get product ID from params
    const productId = Number(params.productId);
    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "شناسه محصول نامعتبر است" },
        { status: 400 }
      );
    }

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
    return NextResponse.json(
      { error: "خطا در جستجوی شعبه‌ها" },
      { status: 500 }
    );
  }
} 