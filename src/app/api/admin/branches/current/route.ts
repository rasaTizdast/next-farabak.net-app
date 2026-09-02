import { NextResponse } from "next/server";

import { notFoundResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/admin/branches/current:
 *   get:
 *     summary: Get the current branch information for warranty management
 *     responses:
 *       200:
 *         description: Returns basic branch information
 *       404:
 *         description: No branch found for this user
 *       401:
 *         description: Unauthorized - user not logged in
 *       500:
 *         description: Server error
 */
export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  // The userId can be stored under different keys in the payload
  // Check common keys: userId, id, sub
  const userId = auth.userId || (auth as any).id || (auth as any).sub;

  if (!userId) {
    return unauthorizedResponse("دسترسی غیرمجاز - اطلاعات کاربر معتبر نیست");
  }

  try {
    // Get branch for this user
    const branch = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT "branchid", "name", "location" FROM "support"."branch"
      WHERE "UserID" = ${Number(userId)}
    `;

    if (!branch || branch.length === 0) {
      return notFoundResponse("هیچ شعبه‌ای برای این کاربر یافت نشد");
    }

    // Return the first branch (users typically have only one branch)
    return NextResponse.json(branch[0]);
  } catch (error) {
    console.error("Error fetching user branch:", error);
    return serverErrorResponse("خطا در بارگذاری اطلاعات شعبه");
  }
}
