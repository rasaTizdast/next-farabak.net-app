import { NextResponse } from "next/server";
import { SignJWT } from "jose";

// Generate a random 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to create a signed JWT token that can be validated later
async function createResetCodeToken(
  email: string,
  code: string
): Promise<string> {
  // Create a JWT with the email and code that expires in 15 minutes
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "farabak-reset-password-secret-key-2024"
  );
  const expiresIn = 15 * 60; // 15 minutes

  const token = await new SignJWT({ email, code })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(secret);

  return token;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "آدرس ایمیل الزامی است" },
        { status: 400 }
      );
    }

    // In a real application, verify if the email exists in your database
    // For demo purposes, we'll assume it exists

    // Generate a verification code
    const code = generateVerificationCode();

    // Create a JWT token with the email and code
    const resetToken = await createResetCodeToken(email, code);

    try {
      // Use the existing send-email API instead of creating a new transporter
      const emailResponse = await fetch(
        new URL("/api/send-email", request.url).toString(),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: email,
            template: "reset-password",
            templateData: { code },
          }),
        }
      );

      if (!emailResponse.ok) {
        const errorData = await emailResponse.json();
        throw new Error(errorData.error || "Failed to send email");
      }

      return NextResponse.json({
        message: "کد بازیابی رمز عبور به ایمیل شما ارسال شد",
        emailSent: true,
        resetToken: resetToken, // Send the token to the client
      });
    } catch (error) {
      console.error("Error sending email:", error);
      return NextResponse.json(
        {
          error: "خطا در ارسال ایمیل",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in forgot-password endpoint:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
