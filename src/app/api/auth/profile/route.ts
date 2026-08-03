import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get the authenticated user's profile.
 *     tags: [auth]
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userId:
 *                   type: string
 *                 firstName:
 *                   type: string
 *                 lastName:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: Internal server error.
 *
 *   patch:
 *     summary: Update the authenticated user's profile.
 *     tags: [auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 description: New first name
 *               lastName:
 *                 type: string
 *                 description: New last name
 *               email:
 *                 type: string
 *                 description: New email
 *               phoneNumber:
 *                 type: string
 *                 description: New phone number
 *               job:
 *                 type: string
 *                 description: New job
 *               city:
 *                 type: string
 *                 description: New city
 *     responses:
 *       200:
 *         description: Profile updated successfully.
 *       400:
 *         description: No valid fields provided for update.
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: Internal server error.
 */
export async function GET(): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "توکن احراز هویت الزامی است" }, { status: 401 });
    }

    // Verify the token
    const decoded = await verifyToken(token);

    const user = await prisma.client.findUnique({
      where: { UserID: parseInt(decoded.userId, 10) },
      select: {
        UserID: true,
        Username: true,
        FirstName: true,
        LastName: true,
        Email: true,
        PhoneNumber: true,
        Role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: "کاربر یافت نشد" }, { status: 404 });
    }

    return NextResponse.json({
      userId: user.UserID,
      username: user.Username,
      firstName: user.FirstName,
      lastName: user.LastName,
      email: user.Email,
      phoneNumber: user.PhoneNumber,
      role: user.Role,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
  }
}

export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ message: "توکن احراز هویت الزامی است" }, { status: 401 });
    }

    // Use jose to verify the token
    const decoded = await verifyToken(token);

    const updates: {
      firstName?: string;
      lastName?: string;
      phoneNumber?: string;
      email?: string;
      city?: string;
      job?: string;
    } = await request.json();

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "هیچ داده‌ای برای به‌روزرسانی ارائه نشده است" },
        { status: 400 }
      );
    }

    await prisma.client.update({
      where: { UserID: parseInt(decoded.userId, 10) },
      data: {
        FirstName: updates.firstName,
        LastName: updates.lastName,
        Email: updates.email,
        PhoneNumber: updates.phoneNumber,
        City: updates.city,
        Job: updates.job,
      },
    });

    return NextResponse.json({ message: "پروفایل با موفقیت به‌روزرسانی شد" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
  }
}
