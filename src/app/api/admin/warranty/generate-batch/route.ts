import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Generates multiple unique warranty codes in a single batch request
 * @swagger
 * /api/admin/warranty/generate-batch:
 *   post:
 *     summary: Generate multiple unique warranty codes in a batch
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               branchCode:
 *                 type: string
 *                 description: The branch code to use in warranty code
 *               yearMonth:
 *                 type: string
 *                 description: The year/month code to use in warranty code
 *               count:
 *                 type: integer
 *                 description: Number of warranty codes to generate
 *     responses:
 *       200:
 *         description: Successfully generated warranty codes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 warrantyCodes:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Bad request - missing required fields
 *       500:
 *         description: Server error
 */
export async function POST(request: Request) {
  try {
    const { branchCode, yearMonth, count } = await request.json();

    if (!branchCode || !yearMonth || !count || count <= 0) {
      return NextResponse.json(
        { error: "کد شعبه، تاریخ و تعداد باید ارسال شود" },
        { status: 400 }
      );
    }

    // Limit maximum number of codes per request for safety
    const actualCount = Math.min(count, 100);

    // Get all existing warranty codes to check against (limit query for performance)
    const existingCodePattern = `${branchCode}-${yearMonth}-%`;
    const existingCodes = await prisma.$queryRaw`
      SELECT "warrantycode" FROM "info"."warranty"
      WHERE "warrantycode" LIKE ${existingCodePattern}
    `;

    const existingCodeSet = new Set(
      (existingCodes as any[]).map((code) => code.warrantycode)
    );

    // Generate unique warranty codes
    const warrantyCodes: string[] = [];
    let attempts = 0;
    const maxAttempts = actualCount * 2; // Allow reasonable number of attempts

    while (warrantyCodes.length < actualCount && attempts < maxAttempts) {
      attempts++;

      // Generate random alphanumeric code
      const randomCode = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();
      const warrantyCode = `${branchCode}-${yearMonth}-${randomCode}`;

      // Check if code is unique
      if (
        !existingCodeSet.has(warrantyCode) &&
        !warrantyCodes.includes(warrantyCode)
      ) {
        warrantyCodes.push(warrantyCode);
      }
    }

    // If we couldn't generate enough unique codes, return an error
    if (warrantyCodes.length < actualCount) {
      return NextResponse.json(
        {
          error:
            "تعداد زیادی کد گارانتی قبلا تولید شده است. لطفا دوباره تلاش کنید",
          generated: warrantyCodes.length,
          requested: actualCount,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ warrantyCodes });
  } catch (error) {
    console.error("Error generating batch warranty codes:", error);
    return NextResponse.json(
      { error: "خطا در تولید کدهای گارانتی" },
      { status: 500 }
    );
  }
}
