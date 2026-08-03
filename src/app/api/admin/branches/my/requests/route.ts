import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { formatBigIntResults } from "@/lib/formatBigInt";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // Verify branch owner
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    if (auth.role !== "Branch") {
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
      requests = await prisma.$queryRaw<any[]>`
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
        AND b."UserID" = ${auth.userId}
        ORDER BY w."warrantyid" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;
    } catch (error) {
      console.error("SQL error in warranty requests query:", error);
      requests = [];
    }

    try {
      // Count total for pagination
      const countResult = await prisma.$queryRaw<{ count: number }[]>`
        SELECT COUNT(*)::integer as count
        FROM "info"."warranty" w
        JOIN "support"."branch" b ON w."branchid" = b."branchid"
        WHERE w."status" = 'Requested'
        AND b."UserID" = ${auth.userId}
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
