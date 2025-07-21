import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

export const dynamic = "force-dynamic";

// Helper function to verify the JWT token
async function verifyCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return null;
  }

  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return {
      id: payload.userId as string,
      role: payload.role as string,
      branchId: payload.branchId as number,
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

// Helper function to format BigInt results to Number
const formatBigIntResults = (results: any[]) => {
  if (!Array.isArray(results)) return [];

  return results.map((row) => {
    if (!row) return row;

    // Convert any BigInt values to Number for JSON serialization
    const formattedRow: any = {};
    Object.entries(row).forEach(([key, value]) => {
      if (typeof value === "bigint") {
        formattedRow[key] = Number(value);
      } else {
        formattedRow[key] = value;
      }
    });
    return formattedRow;
  });
};

export async function GET(req: NextRequest) {
  try {
    // Verify branch owner
    const currentUser = await verifyCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        {
          error: "احراز هویت الزامی است - لطفا وارد شوید",
          requests: [],
          pagination: {
            currentPage: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0,
          },
        },
        { status: 401 }
      );
    }

    if (currentUser.role !== "Branch") {
      return NextResponse.json(
        {
          error: "دسترسی غیرمجاز - فقط مدیران شعبه",
          requests: [],
          pagination: {
            currentPage: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0,
          },
        },
        { status: 401 }
      );
    }

    // Extract pagination parameters from URL
    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let requests = [];
    let totalCount = 0;

    try {
      // Get branch-specific requests with pagination
      requests = await prisma.$queryRaw`
        SELECT 
          w."warrantyid", 
          w."warrantycode", 
          w."startdate", 
          w."expirydate", 
          w."status",
          b."name" as branch_name,
          p."Type" as product_name,
          i."Fullname" as customer_name,
          i."Phonenumber" as customer_phone
        FROM "info"."warranty" w
        JOIN "support"."branch" b ON w."branchid" = b."branchid"
        JOIN "support"."Product" p ON w."ProductId" = p."ProductId"
        LEFT JOIN "info"."Invoice_Details" id ON w."invoicedetailid" = id."Invoice_Details"
        LEFT JOIN "info"."Invoice" i ON id."Invoiceid" = i."Invoiceid"
        WHERE w."status" = 'Requested'
        AND b."UserID" = ${currentUser.id}
        ORDER BY w."warrantyid" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } catch (error) {
      console.error("SQL error in warranty requests query:", error);
      requests = [];
    }

    try {
      // Count total for pagination
      const countResult = await prisma.$queryRaw`
        SELECT COUNT(*)::integer as count
        FROM "info"."warranty" w
        JOIN "support"."branch" b ON w."branchid" = b."branchid"
        WHERE w."status" = 'Requested'
        AND b."UserID" = ${currentUser.id}
      `;

      totalCount =
        countResult && Array.isArray(countResult) && countResult.length > 0
          ? Number(countResult[0].count)
          : 0;
    } catch (error) {
      console.error("SQL error in count query:", error);
      totalCount = 0;
    }

    const formattedRequests = formatBigIntResults(requests as any[]);

    return NextResponse.json({
      requests: formattedRequests,
      pagination: {
        currentPage: page,
        pageSize: limit,
        totalCount: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching branch warranty requests:", error);
    return NextResponse.json(
      {
        error: "خطا در دریافت درخواست‌های گارانتی شعبه",
        requests: [],
        pagination: {
          currentPage: 1,
          pageSize: 10,
          totalCount: 0,
          totalPages: 0,
        },
      },
      { status: 500 }
    );
  }
}
