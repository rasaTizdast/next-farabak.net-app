import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/admin/branches/{branchId}:
 *   get:
 *     summary: Get information about a specific branch
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the branch to retrieve
 *     responses:
 *       200:
 *         description: Returns branch information
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
export async function GET(
  request: Request,
  { params }: { params: { branchId: string } }
) {
  try {
    console.log("Getting branch info for ID:", params.branchId);
    
    if (!params.branchId) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      );
    }

    const branchId = parseInt(params.branchId);
    if (isNaN(branchId)) {
      return NextResponse.json(
        { error: "Invalid branch ID format" },
        { status: 400 }
      );
    }

    const branch = await prisma.$queryRaw`
      SELECT "branchid", "name", "location" FROM "support"."branch"
      WHERE "branchid" = ${branchId}
    `;

    console.log("Branch query result:", branch);

    if (!branch || (branch as any[]).length === 0) {
      return NextResponse.json(
        { error: "Branch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(branch[0]);
  } catch (error) {
    console.error("Error fetching branch:", error);
    return NextResponse.json(
      { error: "Failed to fetch branch information" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/branches/{branchId}:
 *   put:
 *     summary: Update a branch
 *     parameters:
 *       - name: branchId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the branch to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *                 description: New name for the branch
 *               location:
 *                 type: string
 *                 description: New location code for the branch (max 10 chars)
 *     responses:
 *       200:
 *         description: Branch updated successfully
 *       400:
 *         description: Bad request - missing fields or branch name already exists
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
export async function PUT(
  request: Request,
  { params }: { params: { branchId: string } }
) {
  try {
    const branchId = parseInt(params.branchId);
    const { name, location } = await request.json();
    
    if (!name || !location) {
      return NextResponse.json(
        { error: 'نام و کد مکان شعبه الزامی هستند' },
        { status: 400 }
      );
    }
    
    // Check if branch exists
    const branchResult = await prisma.$queryRaw`
      SELECT * FROM "support"."branch"
      WHERE "branchid" = ${branchId}
    `;
    
    if ((branchResult as any[]).length === 0) {
      return NextResponse.json(
        { error: 'شعبه یافت نشد' },
        { status: 404 }
      );
    }
    
    // Check if another branch already has this name (except the current branch)
    const existingBranch = await prisma.$queryRaw`
      SELECT * FROM "support"."branch"
      WHERE "name" = ${name} AND "branchid" != ${branchId}
    `;
    
    if ((existingBranch as any[]).length > 0) {
      return NextResponse.json(
        { error: 'این نام شعبه قبلاً استفاده شده است' },
        { status: 400 }
      );
    }
    
    // Update branch
    const updatedBranch = await prisma.$queryRaw`
      UPDATE "support"."branch"
      SET "name" = ${name}, "location" = ${location}
      WHERE "branchid" = ${branchId}
      RETURNING *
    `;
    
    return NextResponse.json((updatedBranch as any[])[0]);
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json(
      { error: 'خطا در بروزرسانی شعبه' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/branches/{branchId}:
 *   delete:
 *     summary: Delete a branch
 *     parameters:
 *       - name: branchId
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the branch to delete
 *     responses:
 *       200:
 *         description: Branch deleted successfully
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
export async function DELETE(
  request: Request,
  { params }: { params: { branchId: string } }
) {
  try {
    const branchId = parseInt(params.branchId);
    
    // Check if branch exists
    const branchResult = await prisma.$queryRaw`
      SELECT * FROM "support"."branch"
      WHERE "branchid" = ${branchId}
    `;
    
    const branch = (branchResult as any[])[0];
    
    if (!branch) {
      return NextResponse.json(
        { error: 'شعبه یافت نشد' },
        { status: 404 }
      );
    }
    
    // Store the UserID before deleting the branch
    const userId = branch.UserID;
    
    // Delete branch (cascading delete will handle related branch products)
    await prisma.$queryRaw`
      DELETE FROM "support"."branch"
      WHERE "branchid" = ${branchId}
    `;
    
    // Reset the user's role to "Public"
    if (userId) {
      // Check if the user has any other branches
      const otherBranches = await prisma.$queryRaw`
        SELECT COUNT(*) as count 
        FROM "support"."branch"
        WHERE "UserID" = ${userId}
      `;
      
      const hasOtherBranches = parseInt(String((otherBranches as any[])[0].count), 10) > 0;
      
      // Only reset role if user has no other branches
      if (!hasOtherBranches) {
        await prisma.$queryRaw`
          UPDATE "info"."Client"
          SET "Role" = 'Public'
          WHERE "UserID" = ${userId}
        `;
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json(
      { error: 'خطا در حذف شعبه' },
      { status: 500 }
    );
  }
} 