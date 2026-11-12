import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const userRole = auth.role;

    if (!userRole || (userRole !== "Admin" && userRole !== "Branch")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get current date
    const currentDate = new Date();

    // Find all active warranties that have expired
    const expiredWarranties = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT "warrantyid"
      FROM "info"."warranty"
      WHERE "status" = 'Active'
      AND "expirydate" < ${currentDate.toISOString()}
    `;

    // Update expired warranties
    let updatedCount = 0;

    if (expiredWarranties && Array.isArray(expiredWarranties) && expiredWarranties.length > 0) {
      // Build array of warranty IDs to update
      const warrantyIds = expiredWarranties.map((w) => w.warrantyid);

      // Perform update
      await Promise.all(
        warrantyIds.map(async (id) => {
          await prisma.$queryRaw<Record<string, unknown>[]>`
            UPDATE "info"."warranty"
            SET "status" = 'Expired'
            WHERE "warrantyid" = ${id}
          `;
        })
      );
      updatedCount = warrantyIds.length;
    }

    return NextResponse.json(
      {
        message: `Warranty status check completed. ${updatedCount} warranties updated to Expired.`,
        updatedCount,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error checking warranty status:", error);
    return NextResponse.json({ message: "Failed to check warranty status" }, { status: 500 });
  }
}
