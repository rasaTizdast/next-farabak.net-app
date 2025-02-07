// app/api/admin/users/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming you have a prisma client setup
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function POST(request: Request) {
  const { phoneNumber, userId } = await request.json();

  const cookieStore = cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Authorization token required" },
      { status: 401 }
    );
  }

  const decoded = await verifyToken(token);
  const userRole = decoded.role;

  if (!userRole || userRole !== "Admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  if (phoneNumber) {
    // Search for the user by phone number
    const users = await prisma.client.findMany({
      where: {
        PhoneNumber: phoneNumber,
      },
    });
    return NextResponse.json(users);
  }

  if (userId) {
    // Update the user's role to admin
    const updatedUser = await prisma.client.update({
      where: {
        UserID: userId,
      },
      data: {
        Role: "Admin",
      },
    });
    return NextResponse.json(updatedUser);
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 });
}
