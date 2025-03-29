import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * @swagger
 * /api/admin/branches:
 *   get:
 *     summary: Get all branches with product counts and total quantities
 *     responses:
 *       200:
 *         description: List of all branches with product counts and total quantities
 *       500:
 *         description: Server error
 */
export async function GET() {
  try {
    // Get branches with product counts and total quantities in a single query
    const branchesWithCounts = await prisma.$queryRaw`
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
    `;
    
    // Convert any BigInt values to regular Numbers
    const sanitizedData = (branchesWithCounts as any[]).map(branch => {
      const sanitizedBranch: Record<string, any> = {};
      
      for (const [key, value] of Object.entries(branch)) {
        // Convert BigInt to Number
        if (typeof value === 'bigint') {
          sanitizedBranch[key] = Number(value);
        } else {
          sanitizedBranch[key] = value;
        }
      }
      
      return sanitizedBranch;
    });
    
    return NextResponse.json(sanitizedData);
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { error: 'خطا در بارگذاری شعبه‌ها' },
      { status: 500 }
    );
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
      return NextResponse.json(
        { error: 'تمامی فیلدها الزامی هستند' },
        { status: 400 }
      );
    }
    
    // Check if user exists in info schema
    const user = await prisma.$queryRaw`
      SELECT * FROM "info"."Client" 
      WHERE "UserID" = ${parseInt(userId)}
    `;
    
    if (!user || (user as any[]).length === 0) {
      return NextResponse.json(
        { error: 'کاربر مورد نظر پیدا نشد' },
        { status: 404 }
      );
    }
    
    // Check if branch name is already taken in support schema
    const existingBranch = await prisma.$queryRaw`
      SELECT * FROM "support"."branch" 
      WHERE "name" = ${name}
    `;
    
    if ((existingBranch as any[]).length > 0) {
      return NextResponse.json(
        { error: 'این نام شعبه قبلاً استفاده شده است' },
        { status: 400 }
      );
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
    console.error('Error creating branch:', error);
    return NextResponse.json(
      { error: 'خطا در ایجاد شعبه' },
      { status: 500 }
    );
  }
} 