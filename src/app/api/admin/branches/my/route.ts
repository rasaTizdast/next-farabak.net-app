import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/admin/branches/my:
 *   get:
 *     summary: Get the current user's branch information
 *     responses:
 *       200:
 *         description: The branch information for the current user
 *       404:
 *         description: No branch found for this user
 *       401:
 *         description: Unauthorized - user not logged in
 *       500:
 *         description: Server error
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;

    if (!accessToken) {
      console.error("No access token found in cookies");
      return NextResponse.json(
        { error: "دسترسی غیرمجاز - لطفا وارد حساب کاربری خود شوید" },
        { status: 401 }
      );
    }

    try {
      // Verify and decode JWT
      const decoded = await verifyToken(accessToken);

      // The userId can be stored under different keys in the payload
      // Check common keys: userId, id, sub
      const userId = (decoded as any).userId || (decoded as any).id || (decoded as any).sub;

      if (!userId) {
        console.error("JWT payload missing userId:", decoded);
        return NextResponse.json(
          { error: "دسترسی غیرمجاز - اطلاعات کاربر معتبر نیست" },
          { status: 401 }
        );
      }

      // Get branch for this user
      const branch = await prisma.$queryRaw<Record<string, unknown>[]>`
        SELECT * FROM "support"."branch"
        WHERE "UserID" = ${Number(userId)}
      `;

      if (!branch || branch.length === 0) {
        return NextResponse.json({ error: "هیچ شعبه‌ای برای این کاربر یافت نشد" }, { status: 404 });
      }

      // For each branch, count their products and calculate total quantity
      const branchesWithProductCount = await Promise.all(
        branch.map(async (b) => {
          // Get both count and total quantity in one query
          const productStatsResult = await prisma.$queryRaw<Record<string, unknown>[]>`
            SELECT 
              COUNT(DISTINCT "ProductId") as "productCount",
              COALESCE(SUM("quantity"), 0)::integer as "totalQuantity"
            FROM "support"."branchproduct"
            WHERE "branchid" = ${b.branchid}
          `;

          const stats = productStatsResult[0];

          return {
            ...b,
            productCount: parseInt(String(stats.productCount), 10),
            totalQuantity: parseInt(String(stats.totalQuantity), 10),
          };
        })
      );

      // Return the first branch (users typically have only one branch)
      return NextResponse.json(branchesWithProductCount[0]);
    } catch (tokenError) {
      console.error("Token verification failed:", tokenError);
      return NextResponse.json(
        {
          error: "دسترسی غیرمجاز - توکن نامعتبر است",
          details: String(tokenError),
        },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Error fetching user branch:", error);
    return NextResponse.json(
      { error: "خطا در بارگذاری اطلاعات شعبه", details: String(error) },
      { status: 500 }
    );
  }
}
