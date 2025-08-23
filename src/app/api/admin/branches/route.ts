import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/admin/branches:
 *   get:
 *     summary: Get all branches with product counts and total quantities
 *     parameters:
 *       - in: query
 *         name: productId
 *         schema:
 *           type: integer
 *         description: Optional product ID to filter branches that have this product
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of all branches with product counts and total quantities
 *       500:
 *         description: Server error
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get("productId");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let branchesWithCounts;
    let totalCount;
    let totalBranchCount = 0;

    // Always get total count of branches for reference
    const allBranchesCount = await prisma.$queryRaw`
      SELECT COUNT(*) as total FROM "support"."branch"
    `;
    totalBranchCount = Number((allBranchesCount as any[])[0].total);

    if (productId) {
      // First get total count of branches that have this product
      const countResult = await prisma.$queryRaw`
        SELECT COUNT(*) as total
        FROM "support"."branch" b
        WHERE EXISTS (
          SELECT 1 FROM "support"."branchproduct" bp2 
          WHERE bp2."branchid" = b."branchid" AND bp2."ProductId" = ${parseInt(productId)}
        )
      `;

      totalCount = Number((countResult as any[])[0].total);

      // If productId is provided, filter branches that have this product with pagination
      branchesWithCounts = await prisma.$queryRaw`
        SELECT 
          b."branchid",
          b."UserID",
          b."name",
          b."location",
          b."createdat",
          COUNT(DISTINCT bp."ProductId") as "productCount",
          COALESCE(SUM(bp."quantity"), 0)::integer as "totalQuantity",
          COALESCE(MAX(CASE WHEN bp."ProductId" = ${parseInt(
            productId
          )} THEN bp."quantity" ELSE 0 END), 0)::integer as "specificProductQuantity"
        FROM 
          "support"."branch" b
        LEFT JOIN 
          "support"."branchproduct" bp ON b."branchid" = bp."branchid"
        WHERE 
          EXISTS (
            SELECT 1 FROM "support"."branchproduct" bp2 
            WHERE bp2."branchid" = b."branchid" AND bp2."ProductId" = ${parseInt(productId)}
          )
        GROUP BY 
          b."branchid", b."UserID", b."name", b."location", b."createdat"
        ORDER BY
          "specificProductQuantity" DESC
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    } else {
      // Get total count of branches
      const countResult = await prisma.$queryRaw`
        SELECT COUNT(*) as total FROM "support"."branch"
      `;

      totalCount = Number((countResult as any[])[0].total);
      totalBranchCount = totalCount;

      // Get all branches with product counts and total quantities with pagination
      branchesWithCounts = await prisma.$queryRaw`
        SELECT 
          b."branchid",
          b."UserID",
          b."name",
          b."location",
          b."createdat",
          COUNT(DISTINCT bp."ProductId") as "productCount",
          COALESCE(SUM(bp."quantity"), 0)::integer as "totalQuantity"
        FROM 
          "support"."branch" b
        LEFT JOIN 
          "support"."branchproduct" bp ON b."branchid" = bp."branchid"
        GROUP BY 
          b."branchid", b."UserID", b."name", b."location", b."createdat"
        LIMIT ${limit}
        OFFSET ${offset}
      `;
    }

    // Convert any BigInt values to regular Numbers
    const sanitizedData = (branchesWithCounts as any[]).map((branch) => {
      const sanitizedBranch: Record<string, any> = {};

      for (const [key, value] of Object.entries(branch)) {
        // Convert BigInt to Number
        if (typeof value === "bigint") {
          sanitizedBranch[key] = Number(value);
        } else {
          sanitizedBranch[key] = value;
        }
      }

      return sanitizedBranch;
    });

    // Calculate pagination details
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      data: sanitizedData,
      pagination: {
        totalCount,
        totalBranchCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching branches:", error);
    return NextResponse.json({ error: "خطا در بارگذاری شعبه‌ها" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/branches:
 *   post:
 *     summary: Create a new branch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - name
 *               - location
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: ID of the user to associate with the branch
 *               name:
 *                 type: string
 *                 description: Name of the branch
 *               location:
 *                 type: string
 *                 description: Location code for the branch (max 10 chars)
 *     responses:
 *       201:
 *         description: Branch created successfully
 *       400:
 *         description: Bad request - missing fields or branch name already exists
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name, location } = body;

    if (!userId || !name || !location) {
      return NextResponse.json({ error: "تمامی فیلدها الزامی هستند" }, { status: 400 });
    }

    // Check if user exists in info schema
    const user = await prisma.$queryRaw`
      SELECT * FROM "info"."Client" 
      WHERE "UserID" = ${parseInt(userId)}
    `;

    if (!user || (user as any[]).length === 0) {
      return NextResponse.json({ error: "کاربر مورد نظر پیدا نشد" }, { status: 404 });
    }

    // Check if branch name is already taken in support schema
    const existingBranch = await prisma.$queryRaw`
      SELECT * FROM "support"."branch" 
      WHERE "name" = ${name}
    `;

    if ((existingBranch as any[]).length > 0) {
      return NextResponse.json({ error: "این نام شعبه قبلاً استفاده شده است" }, { status: 400 });
    }

    // Create new branch in support schema
    const newBranch = await prisma.$queryRaw`
      INSERT INTO "support"."branch" ("UserID", "name", "location")
      VALUES (${parseInt(userId)}, ${name}, ${location})
      RETURNING *
    `;

    // Update user role to Branch in the Client model
    await prisma.$queryRaw`
      UPDATE "info"."Client"
      SET "Role" = 'Branch'
      WHERE "UserID" = ${parseInt(userId)}
    `;

    return NextResponse.json((newBranch as any[])[0], { status: 201 });
  } catch (error) {
    console.error("Error creating branch:", error);
    return NextResponse.json({ error: "خطا در ایجاد شعبه" }, { status: 500 });
  }
}
