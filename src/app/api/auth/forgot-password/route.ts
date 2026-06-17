import { SignJWT } from "jose";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Generate a random 6-digit code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Function to create a signed JWT token that can be validated later
async function createResetCodeToken(email: string, code: string): Promise<string> {
  // Create a JWT with the email and code that expires in 15 minutes
  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET
  );
  const expiresIn = 15 * 60; // 15 minutes

  const token = await new SignJWT({ email, code })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(secret);

  return token;
}

// Function to send an email with retry logic
async function sendEmailWithRetry(email: string, code: string, maxRetries = 2): Promise<boolean> {
  let retries = 0;

  while (retries <= maxRetries) {
    try {
      const emailResponse = await fetch(
        new URL("/api/send-email", process.env.BASE_URL).toString(),
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

      return true; // Success
    } catch (error) {
      console.error(`Email sending attempt ${retries + 1} failed:`, error);
      retries++;

      if (retries > maxRetries) {
        console.error("All retry attempts failed");
        return false;
      }

      // Wait before retry (exponential backoff)
      await new Promise((resolve) => setTimeout(resolve, 1000 * retries));
    }
  }

  return false;
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "آدرس ایمیل الزامی است" }, { status: 400 });
    }

    // In a real application, verify if the email exists in your database
    // For demo purposes, we'll assume it exists

    // Generate a verification code
    const code = generateVerificationCode();

    // Create a JWT token with the email and code
    const resetToken = await createResetCodeToken(email, code);

    // Try to send the email with retry logic
    const emailSent = await sendEmailWithRetry(email, code);

    if (emailSent) {
      return NextResponse.json({
        message: "کد بازیابی رمز عبور به ایمیل شما ارسال شد",
        emailSent: true,
        resetToken: resetToken, // Send the token to the client
      });
    } else {
      // Email sending failed even after retries
      return NextResponse.json(
        {
          error: "خطا در ارسال ایمیل. لطفا بعدا دوباره تلاش کنید.",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in forgot-password endpoint:", error);
    return NextResponse.json({ error: "خطای سرور" }, { status: 500 });
  }
}
