import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Generates a unique warranty code based on branch code and year/month
 */
export async function POST(request: Request) {
  try {
    const { branchCode, yearMonth } = await request.json();
    
    if (!branchCode || !yearMonth) {
      return NextResponse.json(
        { error: 'کد شعبه و تاریخ باید ارسال شود' },
        { status: 400 }
      );
    }
    
    // Generate unique warranty code
    let isUnique = false;
    let warrantyCode = '';
    let attempts = 0;
    const maxAttempts = 10;
    
    while (!isUnique && attempts < maxAttempts) {
      attempts++;
      // Generate random alphanumeric code
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      warrantyCode = `${branchCode}-${yearMonth}-${randomCode}`;
      
      // Check if code exists in database
      const existingCode = await prisma.$queryRaw`
        SELECT "warrantycode" FROM "info"."warranty"
        WHERE "warrantycode" = ${warrantyCode}
        LIMIT 1
      `;
      
      isUnique = (existingCode as any[]).length === 0;
    }
    
    // If we couldn't generate a unique code after max attempts, use timestamp as fallback
    if (!isUnique) {
      const timestamp = Date.now().toString(36).toUpperCase();
      warrantyCode = `${branchCode}-${yearMonth}-${timestamp}`;
    }
    
    return NextResponse.json({ warrantyCode });
  } catch (error) {
    console.error('Error generating warranty code:', error);
    return NextResponse.json(
      { error: 'خطا در تولید کد گارانتی' },
      { status: 500 }
    );
  }
} 