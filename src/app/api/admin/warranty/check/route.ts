import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Checks if a warranty code already exists in the database
 */
export async function POST(request: Request) {
  try {
    const { warrantycode } = await request.json();

    if (!warrantycode) {
      return NextResponse.json({ error: "کد گارانتی نمی‌تواند خالی باشد" }, { status: 400 });
    }

    // Check if code exists in database
    const existingCode = await prisma.$queryRaw`
      SELECT "warrantycode" FROM "info"."warranty"
      WHERE "warrantycode" = ${warrantycode}
      LIMIT 1
    `;

    const isUnique = (existingCode as any[]).length === 0;

    return NextResponse.json({ isUnique });
  } catch (error) {
    console.error("Error checking warranty code:", error);
    return NextResponse.json({ error: "خطا در بررسی کد گارانتی" }, { status: 500 });
  }
}
