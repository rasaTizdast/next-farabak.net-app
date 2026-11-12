import bcrypt from "bcryptjs";
import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

import { errorResponse, notFoundResponse, serverErrorResponse } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema, validateBody } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const result = await validateBody(request, resetPasswordSchema);
    if ("error" in result) return result.error;
    const { email, code, newPassword, resetToken } = result.data;

    // Verify the JWT token
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(resetToken, secret);

      // Check if the email and code in the token match the provided ones
      if (payload.email !== email || payload.code !== code) {
        return errorResponse("کد بازیابی نامعتبر است", 400);
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
          return notFoundResponse("کاربری با این ایمیل یافت نشد");
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
        return serverErrorResponse("خطا در تغییر رمز عبور");
      }
    } catch (tokenError) {
      // Token verification failed (expired or invalid)
      console.error(tokenError);
      return errorResponse("کد بازیابی منقضی شده یا نامعتبر است", 400);
    }
  } catch (error) {
    console.error("Error in reset-password endpoint:", error);
    return serverErrorResponse("خطای سرور");
  }
}
