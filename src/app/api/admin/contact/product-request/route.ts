import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

export const dynamic = "force-dynamic";

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

export async function POST(request: Request) {
  try {
    // Verify authentication
    const tokenPayload = await verifyToken();

    if (!tokenPayload) {
      return NextResponse.json(
        { error: "احراز هویت الزامی است" },
        { status: 401 }
      );
    }

    // Get user role and ID from token
    const userRole = tokenPayload.role;
    const userId = tokenPayload.sub;

    // Only Branch users can send product requests
    if (userRole !== "Branch") {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز" },
        { status: 403 }
      );
    }

    // Find the user's branch information
    const userWithBranch = await prisma.client.findUnique({
      where: { UserID: Number(userId) },
      include: { branch: true },
    });

    if (!userWithBranch || !userWithBranch.branch || userWithBranch.branch.length === 0) {
      return NextResponse.json(
        { error: "کاربر به شعبه‌ای متصل نیست" },
        { status: 403 }
      );
    }

    // Get request data
    const data = await request.json();
    const { 
      productId, 
      productName, 
      quantity, 
      message, 
      targetBranchId, 
      targetBranchName 
    } = data;

    // Validate request data
    if (!productId || !quantity || !message || !targetBranchId) {
      return NextResponse.json(
        { error: "اطلاعات ناقص است" },
        { status: 400 }
      );
    }

    // Get the current user's branch
    const sourceBranch = userWithBranch.branch[0];

    // Create a product request record in the database
    // If there's no product_requests table yet, we'll simulate storing the request
    // In a real implementation, you would store this in a database table
    
    // For this example, we'll use a notification method - you can replace with actual storage logic
    const requestData = {
      requestId: Date.now(), // simulated ID
      sourceBranchId: sourceBranch.branchid,
      sourceBranchName: sourceBranch.name,
      targetBranchId,
      targetBranchName,
      productId,
      productName,
      quantity,
      message,
      status: "pending",
      createdAt: new Date(),
      createdBy: Number(userId),
      createdByName: `${userWithBranch.FirstName || ""} ${userWithBranch.LastName || ""}`.trim(),
    };

    // In a real implementation, you would save this to a database
    console.log("Product Request Created:", requestData);

    // You might also want to send an email or notification to the admin
    // This would be implemented based on your notification system

    return NextResponse.json({
      success: true,
      message: "درخواست با موفقیت ثبت شد",
      requestId: requestData.requestId,
    });
  } catch (error) {
    console.error("Error creating product request:", error);
    return NextResponse.json(
      { error: "خطا در ثبت درخواست" },
      { status: 500 }
    );
  }
} 