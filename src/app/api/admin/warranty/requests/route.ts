import { NextRequest, NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { formatBigIntResults } from "@/lib/formatBigInt";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    // Verify admin user
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    if (auth.role !== "Admin" && auth.role !== "Branch") {
      return NextResponse.json(
        {
          error: "Unauthorized access",
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

    // Validate userID is a valid number
    const numericUserId = parseInt(auth.userId, 10);
    if (isNaN(numericUserId)) {
      console.error(`[REQUESTS API] UserID is not a valid number: ${auth.userId}`);
      return NextResponse.json(
        {
          error: "Invalid user ID",
          requests: [],
          pagination: {
            currentPage: 1,
            pageSize: 10,
            totalCount: 0,
            totalPages: 0,
          },
        },
        { status: 400 }
      );
    }

    let requests = [];
    let totalCount = 0;

    if (auth.role === "Admin") {
      // Get all requests for admin with pagination
      requests = await prisma.$queryRaw<Record<string, unknown>[]>`
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
        ORDER BY w."warrantyid" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Count total for pagination
      const countResult = await prisma.$queryRaw<Record<string, unknown>[]>`
        SELECT COUNT(*)::integer as count
        FROM "info"."warranty" w
        WHERE w."status" = 'Requested'
      `;

      totalCount =
        countResult && Array.isArray(countResult) && countResult.length > 0
          ? Number(countResult[0].count)
          : 0;
    } else {
      // First check if this user is associated with any branch
      const userBranches = await prisma.branch.findMany({
        where: {
          UserID: numericUserId,
        },
      });

      if (userBranches.length === 0) {
        return NextResponse.json({
          requests: [],
          pagination: {
            currentPage: page,
            pageSize: limit,
            totalCount: 0,
            totalPages: 0,
          },
        });
      }

      // Get branch-specific requests with pagination
      requests = await prisma.$queryRaw<Record<string, unknown>[]>`
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
        AND b."UserID" = ${numericUserId}
        ORDER BY w."warrantyid" DESC
        LIMIT ${limit} OFFSET ${offset}
      `;

      // Count total for pagination
      const countResult = await prisma.$queryRaw<Record<string, unknown>[]>`
        SELECT COUNT(*)::integer as count
        FROM "info"."warranty" w
        JOIN "support"."branch" b ON w."branchid" = b."branchid"
        WHERE w."status" = 'Requested'
        AND b."UserID" = ${numericUserId}
      `;

      totalCount =
        countResult && Array.isArray(countResult) && countResult.length > 0
          ? Number(countResult[0].count)
          : 0;
    }

    const formattedRequests = formatBigIntResults(requests);

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
    console.error("[REQUESTS API] Error fetching warranty requests:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch warranty requests",
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

export async function PUT(req: NextRequest) {
  try {
    // Verify admin user
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    if (auth.role !== "Admin" && auth.role !== "Branch") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const body = await req.json();
    const { warrantyId, action } = body;

    if (!warrantyId || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (action === "resolve") {
      // Get the warranty to check its expiry date
      let warrantyRecord;
      try {
        warrantyRecord = await prisma.$queryRaw<Record<string, unknown>[]>`
          SELECT 
            w.*,
            b."UserID" as branch_user_id
          FROM "info"."warranty" w
          JOIN "support"."branch" b ON w."branchid" = b."branchid"
          WHERE w."warrantyid" = ${warrantyId}
          LIMIT 1
        `;
      } catch (error) {
        console.error("[REQUESTS API] Error fetching warranty details:", error);
        return NextResponse.json({ error: "Error retrieving warranty details" }, { status: 500 });
      }

      if (!Array.isArray(warrantyRecord) || warrantyRecord.length === 0) {
        return NextResponse.json({ error: "Warranty not found" }, { status: 404 });
      }

      // Branch users can only resolve warranties for their own branches
      if (auth.role === "Branch" && warrantyRecord[0].branch_user_id !== auth.userId) {
        return NextResponse.json(
          { error: "You can only resolve warranty requests for your branch" },
          { status: 403 }
        );
      }

      // Determine if warranty is expired
      const now = new Date();
      const expiryDate = new Date(warrantyRecord[0].expirydate as string);
      const newStatus = now > expiryDate ? "Expired" : "Active";

      try {
        // Update the warranty status
        await prisma.$queryRaw<Record<string, unknown>[]>`
          UPDATE "info"."warranty"
          SET "status" = ${newStatus}
          WHERE "warrantyid" = ${warrantyId}
        `;
      } catch (error) {
        console.error("[REQUESTS API] Error updating warranty status:", error);
        return NextResponse.json({ error: "Error updating warranty status" }, { status: 500 });
      }

      return NextResponse.json({
        message: `Warranty request resolved and status updated to ${newStatus}`,
        newStatus,
      });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("[REQUESTS API] Error updating warranty request:", error);
    return NextResponse.json({ error: "Failed to update warranty request" }, { status: 500 });
  }
}
