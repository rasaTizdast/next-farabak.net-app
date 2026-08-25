import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Auth check
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const userRole = auth.role;

    // Only admin or branch users can manage warranties
    if (userRole !== "Admin" && userRole !== "Branch") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get branch ID for the user if they are a branch user
    let branchId = null;
    if (userRole === "Branch") {
      const userId = auth.userId;
      const branch = await prisma.$queryRaw<Record<string, unknown>[]>`
        SELECT "branchid" FROM "support"."branch"
        WHERE "UserID" = ${Number(userId)}
      `;

      if (!branch || branch.length === 0) {
        return NextResponse.json({ error: "No branch found for this user" }, { status: 403 });
      }

      branchId = branch[0].branchid as number;
    }

    // Parse the request body
    const body = await request.json();
    const { warrantyId } = body;

    // Validate required fields
    if (!warrantyId) {
      return NextResponse.json({ error: "Warranty ID is required" }, { status: 400 });
    }

    // Check if the warranty exists
    const existingWarranty = await prisma.warranty.findUnique({
      where: {
        warrantyid: warrantyId,
      },
      include: {
        branch: true,
        Product: true,
      },
    });

    if (!existingWarranty) {
      return NextResponse.json({ error: "Warranty not found" }, { status: 404 });
    }

    // For branch users, verify they can only delete warranties for their own branch
    if (userRole === "Branch" && branchId) {
      if (existingWarranty.branchid !== branchId) {
        return NextResponse.json(
          { error: "You can only delete warranties from your own branch" },
          { status: 403 }
        );
      }
    }

    await prisma.$transaction([
      // Delete the warranty
      prisma.warranty.delete({
        where: {
          warrantyid: warrantyId,
        },
      }),
    ]);

    // Return success response
    return NextResponse.json(
      { success: true, message: "Warranty deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error deleting warranty:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "An error occurred while deleting the warranty",
      },
      { status: 500 }
    );
  }
}
