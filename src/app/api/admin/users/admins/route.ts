// app/api/admins/route.ts
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma"; // Assuming you have a prisma client setup

// Fetch all admins
export async function GET() {
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
  const { userId } = await request.json();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  const updatedUser = await prisma.client.update({
    where: {
      UserID: userId,
    },
    data: {
      Role: "Public",
    },
  });

  return NextResponse.json(updatedUser);
}
