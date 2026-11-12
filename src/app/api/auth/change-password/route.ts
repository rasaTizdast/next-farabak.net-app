import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { serverErrorResponse, unauthorizedResponse } from "@/lib/api-response";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Import Prisma client
import { changePasswordSchema, validateBody } from "@/lib/validation";
const SALT_ROUNDS = 10;

/**
 * @swagger
 * /api/auth/change-password:
 *   patch:
 *     summary: Change the user's password.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 description: The current password for validation.
 *               newPassword:
 *                 type: string
 *                 description: The new password to set.
 *     responses:
 *       200:
 *         description: Password changed successfully.
 *       401:
 *         description: Unauthorized or invalid current password.
 *       500:
 *         description: Internal server error.
 */
export async function PATCH(request: Request): Promise<Response> {
  try {
    // Retrieve the access token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return unauthorizedResponse("توکن احراز هویت مورد نیاز است");
    }

    // Verify JWT and extract userId
    const decoded = await verifyToken(token);
    const { userId } = decoded;

    // Parse the request body
    const result = await validateBody(request, changePasswordSchema);
    if ("error" in result) return result.error;
    const { currentPassword, newPassword } = result.data;

    // Fetch the user's active password
    const activePasswordRecord = await prisma.password.findFirst({
      where: {
        UserId: parseInt(userId, 10),
        Active: true,
      },
    });

    if (!activePasswordRecord) {
      return unauthorizedResponse("رمز عبور فعلی یافت نشد");
    }

    // Validate the current password
    if (!activePasswordRecord.Password1) {
      return unauthorizedResponse("رمز عبور فعلی نامعتبر است");
    }

    const passwordMatch = await bcrypt.compare(currentPassword, activePasswordRecord.Password1);
    if (!passwordMatch) {
      return unauthorizedResponse("رمز عبور فعلی اشتباه است");
    }

    // Hash the new password and deactivate old passwords in parallel
    const [hashedNewPassword] = await Promise.all([
      bcrypt.hash(newPassword, SALT_ROUNDS),
      prisma.password.updateMany({
        where: { UserId: parseInt(userId, 10), Active: true },
        data: { Active: false },
      }),
    ]);

    // Save the new password
    await prisma.password.create({
      data: {
        UserId: parseInt(userId, 10),
        Password1: hashedNewPassword,
        Active: true,
      },
    });

    return NextResponse.json({ message: "رمز عبور با موفقیت تغییر یافت" });
  } catch (error) {
    console.error(error);
    return serverErrorResponse("خطای داخلی سرور");
  }
}
