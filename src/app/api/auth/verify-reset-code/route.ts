import { jwtVerify } from "jose";
import { NextResponse } from "next/server";

import { errorResponse, serverErrorResponse } from "@/lib/api-response";
import { validateBody, verifyResetCodeSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const result = await validateBody(request, verifyResetCodeSchema);
    if ("error" in result) return result.error;
    const { email, code, resetToken } = result.data;

    // Verify the JWT token
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(resetToken, secret);

      // Check if the email and code in the token match the provided ones
      if (payload.email !== email || payload.code !== code) {
        return errorResponse("کد بازیابی نامعتبر است", 400);
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
      return errorResponse("کد بازیابی منقضی شده یا نامعتبر است", 400);
    }
  } catch (error) {
    console.error("Error in verify-reset-code endpoint:", error);
    return serverErrorResponse("خطای سرور");
  }
}
