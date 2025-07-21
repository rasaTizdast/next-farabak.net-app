import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { prisma } from "@/lib/prisma"; // Import Prisma client

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
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
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    // Retrieve the access token from cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "توکن احراز هویت مورد نیاز است" },
        { status: 401 }
      );
    }

    // Verify JWT and extract userId
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(JWT_SECRET)
    );
    const { userId } = payload as { userId: string };

    // Parse the request body
    const { currentPassword, newPassword } = await request.json();

    // Fetch the user's active password
    const activePasswordRecord = await prisma.password.findFirst({
      where: {
        UserId: parseInt(userId, 10),
        Active: true,
      },
    });

    if (!activePasswordRecord) {
      return NextResponse.json(
        { message: "رمز عبور فعلی یافت نشد" },
        { status: 401 }
      );
    }

    // Validate the current password
    if (!activePasswordRecord.Password1) {
      return NextResponse.json(
        { message: "رمز عبور فعلی نامعتبر است" },
        { status: 401 }
      );
    }

    const passwordMatch = await bcrypt.compare(
      currentPassword,
      activePasswordRecord.Password1
    );
    if (!passwordMatch) {
      return NextResponse.json(
        { message: "رمز عبور فعلی اشتباه است" },
        { status: 401 }
      );
    }

    // Hash the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);

    // Deactivate old passwords
    await prisma.password.updateMany({
      where: { UserId: parseInt(userId, 10), Active: true },
      data: { Active: false },
    });

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
    return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
  }
}
