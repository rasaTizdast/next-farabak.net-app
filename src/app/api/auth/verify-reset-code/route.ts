import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email, code, resetToken } = await request.json();

    if (!email || !code || !resetToken) {
      return NextResponse.json(
        { error: "ایمیل، کد بازیابی و توکن بازیابی الزامی هستند" },
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

      // If we get here, the token is valid
      return NextResponse.json({
        message: "کد بازیابی تایید شد",
        valid: true,
        // Pass the token back to the client for use in the reset step
        resetToken,
      });
    } catch (error) {
      // Token verification failed (expired or invalid)
      console.error(error);
      return NextResponse.json({ error: "کد بازیابی منقضی شده یا نامعتبر است" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error in verify-reset-code endpoint:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
