import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

export const dynamic = "force-dynamic";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

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
    const cookieStore = cookies();
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
      const { payload } = await jwtVerify(
        accessToken,
        new TextEncoder().encode(JWT_SECRET)
      );

      // The userId can be stored under different keys in the payload
      // Check common keys: userId, id, sub
      const userId = payload.userId || payload.id || payload.sub;

      if (!userId) {
        console.error("JWT payload missing userId:", payload);
        return NextResponse.json(
          { error: "دسترسی غیرمجاز - اطلاعات کاربر معتبر نیست" },
          { status: 401 }
        );
      }

      // Get branch for this user
      const branch = await prisma.$queryRaw`
        SELECT * FROM "support"."branch"
        WHERE "UserID" = ${Number(userId)}
      `;

      if (!branch || (branch as any[]).length === 0) {
        return NextResponse.json(
          { error: "هیچ شعبه‌ای برای این کاربر یافت نشد" },
          { status: 404 }
        );
      }

      // For each branch, count their products and calculate total quantity
      const branchesWithProductCount = await Promise.all(
        (branch as any[]).map(async (b) => {
          // Get both count and total quantity in one query
          const productStatsResult = await prisma.$queryRaw`
            SELECT 
              COUNT(DISTINCT "ProductId") as "productCount",
              COALESCE(SUM("quantity"), 0)::integer as "totalQuantity"
            FROM "support"."branchproduct"
            WHERE "branchid" = ${b.branchid}
          `;

          const stats = (productStatsResult as any[])[0];

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
