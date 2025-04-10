import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

// Helper function to verify the JWT token
async function verifyToken() {
  const cookieStore = cookies();
  const token = cookieStore.get("accessToken")?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

/**
 * GET handler for fetching all branches for dropdowns
 * This is a simplified endpoint without pagination for use in UI components like selects
 */
export async function GET() {
  try {
    // Verify authentication
    const tokenPayload = await verifyToken();
    
    if (!tokenPayload) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Get user role from token
    const userRole = tokenPayload.role;
    const userId = tokenPayload.userId;
    
    // Only Admin or Branch users can see branches
    if (userRole !== "Admin" && userRole !== "Branch") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 403 }
      );
    }
    
    // Get all branches with simplified data for dropdowns
    const branches = await prisma.branch.findMany({
      select: {
        branchid: true,
        name: true,
        location: true
      },
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(branches);
  } catch (error) {
    console.error('Error fetching branches list:', error);
    return NextResponse.json(
      { error: 'خطا در بارگذاری لیست شعبه‌ها' },
      { status: 500 }
    );
  }
} 