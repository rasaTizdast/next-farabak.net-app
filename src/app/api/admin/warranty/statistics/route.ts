import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

export const dynamic = "force-dynamic";

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return {
      userId: payload.userId as string,
      role: payload.role as string,
      branchId: payload.branchId as number,
    };
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// Helper function to format BigInt in query results to Number
function formatBigIntResults(results: any[]) {
  if (!Array.isArray(results)) return [];

  return results.map((item) => {
    if (!item) return item;

    const formattedItem: any = {};
    Object.keys(item).forEach((key) => {
      if (typeof item[key] === "bigint") {
        formattedItem[key] = Number(item[key]);
      } else {
        formattedItem[key] = item[key];
      }
    });
    return formattedItem;
  });
}

/**
 * Get warranty statistics for branches
 */
export async function GET() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        {
          message: "Authorization token required",
          allBranches: [],
          myBranches: [],
        },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        {
          message: "Invalid token",
          allBranches: [],
          myBranches: [],
        },
        { status: 401 }
      );
    }

    const userRole = decoded.role;
    const userId = decoded.userId;

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
        const branchStats = await prisma.$queryRaw`
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

        const formattedStats = formatBigIntResults(branchStats as any[]);
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
          const branchStats = await prisma.$queryRaw`
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

          const formattedStats = formatBigIntResults(branchStats as any[]);
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
