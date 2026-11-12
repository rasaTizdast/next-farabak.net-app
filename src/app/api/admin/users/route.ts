// app/api/admin/users/route.ts
import { NextResponse } from "next/server";

import { errorResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { userSearchSchema, validateBody } from "@/lib/validation";

/**
 * @swagger
 * /api/admin/users:
 *   post:
 *     summary: Search for users by phone number or update a user's role to admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: Phone number to search for
 *               userId:
 *                 type: integer
 *                 description: User ID to update to admin role
 *     responses:
 *       200:
 *         description: Users found or user updated successfully
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       400:
 *         description: Bad request - Invalid parameters
 */
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (auth.role?.toLowerCase() !== "admin") return errorResponse("Forbidden", 403);

  const bodyValidation = await validateBody(request, userSearchSchema);
  if ("error" in bodyValidation) return bodyValidation.error;

  const { phoneNumber, userId } = bodyValidation.data;

  if (phoneNumber) {
    // Search for the user by phone number
    const users = await prisma.client.findMany({
      where: {
        PhoneNumber: phoneNumber,
      },
      select: {
        UserID: true,
        FirstName: true,
        LastName: true,
        PhoneNumber: true,
        Role: true,
      },
    });
    return NextResponse.json(users);
  }

  if (userId) {
    // Update the user's role to admin
    const updatedUser = await prisma.client.update({
      where: {
        UserID: userId,
      },
      data: {
        Role: "Admin",
      },
    });
    return NextResponse.json(updatedUser);
  }

  return errorResponse("Invalid request", 400);
}

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users that can be converted to branches
 *     responses:
 *       200:
 *         description: List of users without branches
 *       500:
 *         description: Server error
 */
export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (auth.role?.toLowerCase() !== "admin") return errorResponse("Forbidden", 403);

  try {
    // Get all users with left join to check if they have branches
    const usersWithBranches = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT 
        c."UserID", 
        c."Username", 
        c."FirstName", 
        c."LastName", 
        c."PhoneNumber",
        c."Email",
        CASE WHEN b."branchid" IS NULL THEN 0 ELSE 1 END as has_branch
      FROM "info"."Client" c
      LEFT JOIN "support"."branch" b ON c."UserID" = b."UserID"
    `;

    // Filter out users that already have branches
    const usersWithoutBranches = (
      usersWithBranches as {
        UserID: number;
        Username: string;
        FirstName: string;
        LastName: string;
        PhoneNumber: string;
        Email: string;
        has_branch: number;
      }[]
    ).filter((user) => user.has_branch === 0);

    // Remove the has_branch property from the response
    const cleanedUsers = usersWithoutBranches.map(({ has_branch: _has_branch, ...user }) => user);
    return NextResponse.json(cleanedUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return serverErrorResponse("خطا در بارگذاری کاربران");
  }
}
