// app/api/admins/route.ts
import { NextResponse } from "next/server";

import { serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma"; // Assuming you have a prisma client setup
import { userIdSchema, validateBody } from "@/lib/validation";

// Fetch all admins
export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  const admins = await prisma.client.findMany({
    where: {
      Role: "Admin",
    },
    select: {
      UserID: true,
      FirstName: true,
      LastName: true,
      PhoneNumber: true,
      Email: true,
      Role: true,
    },
  });
  return NextResponse.json(admins);
}

// Demote an admin to "Public"
export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const bodyValidation = await validateBody(request, userIdSchema);
    if ("error" in bodyValidation) return bodyValidation.error;

    const { userId } = bodyValidation.data;

    const updatedUser = await prisma.client.update({
      where: {
        UserID: userId,
      },
      data: {
        Role: "Public",
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error demoting admin:", error);
    return serverErrorResponse("خطا در تغییر نقش کاربر");
  }
}
