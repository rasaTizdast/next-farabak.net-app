import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export const dynamic = "force-dynamic";

/**
 * Generates multiple unique warranty codes in a batch
 */
export async function POST(request: Request) {
  try {
    // Auth check
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const userRole = decoded.role;

    // Only admin or branch users can generate warranty codes
    if (!userRole || (userRole !== "Admin" && userRole !== "Branch")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { branchCode, yearMonth, count } = await request.json();
    
    if (!branchCode || !yearMonth || !count) {
      return NextResponse.json(
        { error: 'کد شعبه، تاریخ و تعداد باید ارسال شود' },
        { status: 400 }
      );
    }
    
    // Limit the maximum number of codes that can be generated at once
    const requestedCount = Math.min(count, 100);
    
    // Generate multiple unique warranty codes
    const warrantyCodes: string[] = [];
    
    // Get existing codes with this prefix for optimization
    const prefix = `${branchCode}-${yearMonth}`;
    const existingCodes = new Set<string>();
    const existingCodesResult = await prisma.$queryRaw`
      SELECT "warrantycode" FROM "info"."warranty"
      WHERE "warrantycode" LIKE ${prefix + '-%'}
    `;
    
    (existingCodesResult as any[]).forEach(code => {
      existingCodes.add(code.warrantycode);
    });
    
    // Generate codes
    for (let i = 0; i < requestedCount; i++) {
      let isUnique = false;
      let warrantyCode = '';
      let attempts = 0;
      const maxAttempts = 10;
      
      while (!isUnique && attempts < maxAttempts) {
        attempts++;
        // Generate random alphanumeric code
        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        warrantyCode = `${branchCode}-${yearMonth}-${randomCode}`;
        
        // Check if code is unique
        isUnique = !existingCodes.has(warrantyCode) && !warrantyCodes.includes(warrantyCode);
      }
      
      // If we couldn't generate a unique code after max attempts, use timestamp + index as fallback
      if (!isUnique) {
        const timestamp = Date.now().toString(36).toUpperCase();
        warrantyCode = `${branchCode}-${yearMonth}-${timestamp}-${i}`;
      }
      
      warrantyCodes.push(warrantyCode);
      existingCodes.add(warrantyCode);
    }
    
    return NextResponse.json({ warrantyCodes });
  } catch (error) {
    console.error('Error generating batch warranty codes:', error);
    return NextResponse.json(
      { error: 'خطا در تولید کدهای گارانتی' },
      { status: 500 }
    );
  }
}
