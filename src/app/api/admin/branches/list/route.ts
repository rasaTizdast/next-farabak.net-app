import { NextResponse } from "next/server";

import { errorResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * GET handler for fetching all branches for dropdowns
 * This is a simplified endpoint without pagination for use in UI components like selects
 */
export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const userRole = auth.role;

    // Only Admin or Branch users can see branches
    if (userRole !== "Admin" && userRole !== "Branch") {
      return errorResponse("دسترسی غیرمجاز", 403);
    }

    // Get all branches with simplified data for dropdowns
    const branches = await prisma.branch.findMany({
      select: {
        branchid: true,
        name: true,
        location: true,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(branches);
  } catch (error) {
    console.error("Error fetching branches list:", error);
    return serverErrorResponse("خطا در بارگذاری لیست شعبه‌ها");
  }
}
