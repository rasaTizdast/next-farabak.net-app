import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, code, newPassword, resetToken } = await request.json();

    if (!email || !code || !newPassword || !resetToken) {
      return NextResponse.json(
        {
          error: "ایمیل، کد بازیابی، رمز عبور جدید و توکن بازیابی الزامی هستند",
        },
        { status: 400 }
      );
    }

    // Verify the JWT token
    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || "farabak-reset-password-secret-key-2024"
      );
      const { payload } = await jwtVerify(resetToken, secret);

      // Check if the email and code in the token match the provided ones
      if (payload.email !== email || payload.code !== code) {
        return NextResponse.json({ error: "کد بازیابی نامعتبر است" }, { status: 400 });
      }

      // If we get here, the token is valid - update the user's password
      try {
        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Find the user by email
        const user = await prisma.client.findFirst({
          where: {
            Email: email,
          },
        });

        if (!user) {
          return NextResponse.json({ error: "کاربری با این ایمیل یافت نشد" }, { status: 404 });
        }

        // Create a new password entry for the user
        await prisma.password.create({
          data: {
            Password1: hashedPassword,
            UserId: user.UserID,
            Active: true,
          },
        });

        // Set all other passwords for this user to inactive
        await prisma.password.updateMany({
          where: {
            UserId: user.UserID,
            PasswordId: {
              not: {
                equals: await prisma.password
                  .findFirst({
                    where: {
                      UserId: user.UserID,
                      Password1: hashedPassword,
                    },
                    select: { PasswordId: true },
                  })
                  .then((p) => p?.PasswordId),
              },
            },
          },
          data: {
            Active: false,
          },
        });

        return NextResponse.json({
          message: "رمز عبور با موفقیت تغییر یافت",
          success: true,
        });
      } catch (dbError) {
        console.error("Database error:", dbError);
        return NextResponse.json(
          {
            error: "خطا در تغییر رمز عبور",
            details: dbError instanceof Error ? dbError.message : "Unknown error",
          },
          { status: 500 }
        );
      } finally {
        await prisma.$disconnect();
      }
    } catch (tokenError) {
      // Token verification failed (expired or invalid)
      console.error(tokenError);
      return NextResponse.json({ error: "کد بازیابی منقضی شده یا نامعتبر است" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in reset-password endpoint:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
