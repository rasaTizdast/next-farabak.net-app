import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function POST(request: Request) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Authorization token required" }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    const userRole = decoded.role;

    // Only admin or branch users can manage warranties
    if (!userRole || (userRole !== "Admin" && userRole !== "Branch")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get branch ID for the user if they are a branch user
    let branchId = null;
    if (userRole === "Branch") {
      const userId = decoded.userId || decoded.id || decoded.sub;
      const branch = await prisma.$queryRaw`
        SELECT "branchid" FROM "support"."branch"
        WHERE "UserID" = ${Number(userId)}
      `;

      if (!branch || (branch as any[]).length === 0) {
        return NextResponse.json({ error: "No branch found for this user" }, { status: 403 });
      }

      branchId = (branch as any[])[0].branchid;
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
  } catch (error: any) {
    console.error("Error deleting warranty:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while deleting the warranty" },
      { status: 500 }
    );
  }
}
