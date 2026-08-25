import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { formatBigIntResults } from "@/lib/formatBigInt";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Get warranty statistics for branches
 */
export async function GET() {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const userRole = auth.role;
    const userId = auth.userId;

    if (!userRole || (userRole !== "Admin" && userRole !== "Branch")) {
      return NextResponse.json(
        {
          message: "Unauthorized",
          allBranches: [],
          myBranches: [],
        },
        { status: 401 }
      );
    }

    let result;

    if (userRole === "Admin") {
      // For admin, get statistics for all branches
      try {
        const branchStats = await prisma.$queryRaw<Record<string, unknown>[]>`
          SELECT 
            b."branchid", 
            b."name" as branch_name,
            COALESCE(COUNT(CASE WHEN w."status" = 'Active' THEN 1 END), 0)::integer as active_count,
            COALESCE(COUNT(CASE WHEN w."status" = 'Expired' THEN 1 END), 0)::integer as expired_count,
            COALESCE(COUNT(CASE WHEN w."status" = 'Requested' THEN 1 END), 0)::integer as requested_count
          FROM "support"."branch" b
          LEFT JOIN "info"."warranty" w ON b."branchid" = w."branchid"
          GROUP BY b."branchid", b."name"
          ORDER BY b."name"
        `;

        const formattedStats = formatBigIntResults(branchStats);
        result = { allBranches: formattedStats, myBranches: [] };
      } catch (error) {
        console.error("[STATS API] SQL error in admin branch stats:", error);
        result = { allBranches: [], myBranches: [] };
      }
    } else {
      try {
        // Validate userID is a valid number
        const numericUserId = parseInt(userId, 10);
        if (isNaN(numericUserId)) {
          console.error(`[STATS API] UserID is not a valid number: ${userId}`);
          return NextResponse.json(
            {
              message: "Invalid user ID",
              allBranches: [],
              myBranches: [],
            },
            { status: 400 }
          );
        }

        // First check if this user is associated with any branch
        const userBranches = await prisma.branch.findMany({
          where: {
            UserID: numericUserId,
          },
        });

        if (userBranches.length === 0) {
          result = { allBranches: [], myBranches: [] };
        } else {
          const branchStats = await prisma.$queryRaw<Record<string, unknown>[]>`
            SELECT 
              b."branchid", 
              b."name" as branch_name,
              COALESCE(COUNT(CASE WHEN w."status" = 'Active' THEN 1 END), 0)::integer as active_count,
              COALESCE(COUNT(CASE WHEN w."status" = 'Expired' THEN 1 END), 0)::integer as expired_count,
              COALESCE(COUNT(CASE WHEN w."status" = 'Requested' THEN 1 END), 0)::integer as requested_count
            FROM "support"."branch" b
            LEFT JOIN "info"."warranty" w ON b."branchid" = w."branchid"
            WHERE b."UserID" = ${numericUserId}
            GROUP BY b."branchid", b."name"
            ORDER BY b."name"
          `;

          const formattedStats = formatBigIntResults(branchStats);
          result = { allBranches: [], myBranches: formattedStats };
        }
      } catch (error) {
        console.error("[STATS API] SQL error in branch stats:", error);
        result = { allBranches: [], myBranches: [] };
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[STATS API] Error getting warranty statistics:", error);
    return NextResponse.json(
      {
        message: "Failed to get warranty statistics",
        allBranches: [],
        myBranches: [],
      },
      { status: 500 }
    );
  }
}
