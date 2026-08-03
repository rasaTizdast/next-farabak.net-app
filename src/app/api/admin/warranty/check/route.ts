import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Checks if a warranty code already exists in the database
 */
export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    const { warrantycode } = await request.json();

    if (!warrantycode) {
      return NextResponse.json({ error: "کد گارانتی نمی‌تواند خالی باشد" }, { status: 400 });
    }

    // Check if code exists in database
    const existingCode = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT "warrantycode" FROM "info"."warranty"
      WHERE "warrantycode" = ${warrantycode}
      LIMIT 1
    `;

    const isUnique = existingCode.length === 0;

    return NextResponse.json({ isUnique });
  } catch (error) {
    console.error("Error checking warranty code:", error);
    return NextResponse.json({ error: "خطا در بررسی کد گارانتی" }, { status: 500 });
  }
}
