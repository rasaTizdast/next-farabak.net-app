import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

// Helper function to format BigInt in query results to Number
function formatBigIntResults(results: any[]) {
  if (!Array.isArray(results)) return [];
  
  return results.map(item => {
    if (!item) return item;
    
    const formattedItem: any = {};
    Object.keys(item).forEach(key => {
      if (typeof item[key] === 'bigint') {
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
          myBranches: [] 
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
          myBranches: [] 
        },
        { status: 401 }
      );
    }
    
    const userRole = decoded.role;
    const userId = decoded.id;

    if (!userRole || (userRole !== "Admin" && userRole !== "Branch")) {
      return NextResponse.json(
        { 
          message: "Unauthorized", 
          allBranches: [],
          myBranches: [] 
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
            COUNT(CASE WHEN w."status" = 'Active' THEN 1 END)::integer as active_count,
            COUNT(CASE WHEN w."status" = 'Expired' THEN 1 END)::integer as expired_count,
            COUNT(CASE WHEN w."status" = 'Requested' THEN 1 END)::integer as requested_count
          FROM "support"."branch" b
          LEFT JOIN "info"."warranty" w ON b."branchid" = w."branchid"
          GROUP BY b."branchid", b."name"
          ORDER BY b."name"
        `;

        const formattedStats = formatBigIntResults(branchStats as any[]);
        result = { allBranches: formattedStats, myBranches: [] };
      } catch (error) {
        console.error("SQL error in admin branch stats:", error);
        result = { allBranches: [], myBranches: [] };
      }
    } else {
      // For branch user, get statistics only for their branches
      try {
        const branchStats = await prisma.$queryRaw`
          SELECT 
            b."branchid", 
            b."name" as branch_name,
            COUNT(CASE WHEN w."status" = 'Active' THEN 1 END)::integer as active_count,
            COUNT(CASE WHEN w."status" = 'Expired' THEN 1 END)::integer as expired_count,
            COUNT(CASE WHEN w."status" = 'Requested' THEN 1 END)::integer as requested_count
          FROM "support"."branch" b
          LEFT JOIN "info"."warranty" w ON b."branchid" = w."branchid"
          WHERE b."UserID" = ${userId}
          GROUP BY b."branchid", b."name"
          ORDER BY b."name"
        `;

        const formattedStats = formatBigIntResults(branchStats as any[]);
        result = { allBranches: [], myBranches: formattedStats };
      } catch (error) {
        console.error("SQL error in branch stats:", error);
        result = { allBranches: [], myBranches: [] };
      }
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error getting warranty statistics:", error);
    return NextResponse.json(
      { 
        message: "Failed to get warranty statistics",
        allBranches: [],
        myBranches: [] 
      },
      { status: 500 }
    );
  }
} 