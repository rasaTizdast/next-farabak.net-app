import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

export const dynamic = "force-dynamic";

// Helper function to verify the JWT token
async function verifyToken() {
  const cookieStore = cookies();
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
 * GET handler for fetching branches that have stock of a specific product
 * Used for warranty assignment to only show branches with available products
 */
export async function GET(request: Request) {
  try {
    // Get productId from URL
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "شناسه محصول الزامی است" },
        { status: 400 }
      );
    }

    // Verify authentication
    const tokenPayload = await verifyToken();

    if (!tokenPayload) {
      return NextResponse.json(
        { error: "احراز هویت الزامی است" },
        { status: 401 }
      );
    }

    // Get user role from token
    const userRole = tokenPayload.role;

    // Only Admin or Branch users can see branches
    if (userRole !== "Admin" && userRole !== "Branch") {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    // Get branches that have stock of the specific product
    const branchesWithStock = await prisma.branchproduct.findMany({
      where: {
        ProductId: parseInt(productId),
        quantity: {
          gt: 0, // Only include branches with quantity > 0
        },
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
    return NextResponse.json(
      { error: "خطا در بارگذاری لیست شعبه‌ها" },
      { status: 500 }
    );
  }
}
