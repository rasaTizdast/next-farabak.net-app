import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

/**
 * @swagger
 * /api/admin/warranty/check-status:
 *   post:
 *     summary: Check and update warranty status based on expiry date
 *     description: Checks all active warranties and updates their status to 'Expired' if the expiry date has passed
 *     tags:
 *       - Admin
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully checked and updated warranty statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedCount:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const userRole = decoded.role;

    if (!userRole || (userRole !== "Admin" && userRole !== "Branch")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get current date
    const currentDate = new Date();
    
    // Find all active warranties that have expired
    const expiredWarranties = await prisma.$queryRaw`
      SELECT "warrantyid"
      FROM "info"."warranty"
      WHERE "status" = 'Active'
      AND "expirydate" < ${currentDate.toISOString()}
    `;

    // Update expired warranties
    let updatedCount = 0;
    
    if (expiredWarranties && Array.isArray(expiredWarranties) && expiredWarranties.length > 0) {
      // Build array of warranty IDs to update
      const warrantyIds = (expiredWarranties as any[]).map(
        (w) => w.warrantyid
      );
      
      // Perform update
      for (const id of warrantyIds) {
        await prisma.$queryRaw`
          UPDATE "info"."warranty"
          SET "status" = 'Expired'
          WHERE "warrantyid" = ${id}
        `;
        updatedCount++;
      }
    }

    return NextResponse.json(
      {
        message: `Warranty status check completed. ${updatedCount} warranties updated to Expired.`,
        updatedCount
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking warranty status:", error);
    return NextResponse.json(
      { message: "Failed to check warranty status" },
      { status: 500 }
    );
  }
} 