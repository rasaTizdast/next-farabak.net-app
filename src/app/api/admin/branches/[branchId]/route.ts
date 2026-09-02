import { NextResponse } from "next/server";

import { errorResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  branchIdParamSchema,
  updateBranchSchema,
  validateBody,
  validateParams,
} from "@/lib/validation";

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
export async function GET(request: Request, props: { params: Promise<{ branchId: string }> }) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  const paramValidation = validateParams(params, branchIdParamSchema);
  if ("error" in paramValidation) return paramValidation.error;
  try {
    const branchId = paramValidation.data.branchId;

    const branch = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT "branchid", "name", "location" FROM "support"."branch"
      WHERE "branchid" = ${branchId}
    `;

    if (!branch || branch.length === 0) {
      return notFoundResponse("Branch not found");
    }

    return NextResponse.json(branch[0]);
  } catch (error) {
    console.error("Error fetching branch:", error);
    return serverErrorResponse("خطا در بارگذاری اطلاعات شعبه");
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
export async function PUT(request: Request, props: { params: Promise<{ branchId: string }> }) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  const paramValidation = validateParams(params, branchIdParamSchema);
  if ("error" in paramValidation) return paramValidation.error;
  const bodyValidation = await validateBody(request, updateBranchSchema);
  if ("error" in bodyValidation) return bodyValidation.error;
  try {
    const branchId = paramValidation.data.branchId;
    const { name, location } = bodyValidation.data;

    // Check if branch exists
    const branchResult = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM "support"."branch"
      WHERE "branchid" = ${branchId}
    `;

    if (branchResult.length === 0) {
      return notFoundResponse("شعبه یافت نشد");
    }

    // Check if another branch already has this name (except the current branch)
    const existingBranch = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM "support"."branch"
      WHERE "name" = ${name} AND "branchid" != ${branchId}
    `;

    if (existingBranch.length > 0) {
      return errorResponse("این نام شعبه قبلاً استفاده شده است", 400);
    }

    // Update branch
    const updatedBranch = await prisma.$queryRaw<Record<string, unknown>[]>`
      UPDATE "support"."branch"
      SET "name" = ${name}, "location" = ${location}
      WHERE "branchid" = ${branchId}
      RETURNING *
    `;

    return NextResponse.json(updatedBranch[0]);
  } catch (error) {
    console.error("Error updating branch:", error);
    return serverErrorResponse("خطا در بروزرسانی شعبه");
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
export async function DELETE(request: Request, props: { params: Promise<{ branchId: string }> }) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  const paramValidation = validateParams(params, branchIdParamSchema);
  if ("error" in paramValidation) return paramValidation.error;
  try {
    const branchId = paramValidation.data.branchId;

    // Check if branch exists
    const branchResult = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM "support"."branch"
      WHERE "branchid" = ${branchId}
    `;

    const branch = branchResult[0];

    if (!branch) {
      return notFoundResponse("شعبه یافت نشد");
    }

    // Store the UserID before deleting the branch
    const userId = branch.UserID;

    // Delete branch (cascading delete will handle related branch products)
    await prisma.$queryRaw<Record<string, unknown>[]>`
      DELETE FROM "support"."branch"
      WHERE "branchid" = ${branchId}
    `;

    // Reset the user's role to "Public"
    if (userId) {
      // Check if the user has any other branches
      const otherBranches = await prisma.$queryRaw<Record<string, unknown>[]>`
        SELECT COUNT(*) as count 
        FROM "support"."branch"
        WHERE "UserID" = ${userId}
      `;

      const hasOtherBranches = parseInt(String(otherBranches[0].count), 10) > 0;

      // Only reset role if user has no other branches
      if (!hasOtherBranches) {
        await prisma.$queryRaw<Record<string, unknown>[]>`
          UPDATE "info"."Client"
          SET "Role" = 'Public'
          WHERE "UserID" = ${userId}
        `;
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting branch:", error);
    return serverErrorResponse("خطا در حذف شعبه");
  }
}
