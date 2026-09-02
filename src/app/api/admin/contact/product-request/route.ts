import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    const userRole = auth.role;
    const userId = auth.userId;

    // Only Branch users can send product requests
    if (userRole !== "Branch") {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 403 });
    }

    // Find the user's branch information
    const userWithBranch = await prisma.client.findUnique({
      where: { UserID: Number(userId) },
      include: { branch: true },
    });

    if (!userWithBranch || !userWithBranch.branch || userWithBranch.branch.length === 0) {
      return NextResponse.json({ error: "کاربر به شعبه‌ای متصل نیست" }, { status: 403 });
    }

    // Get request data
    const data = await request.json();
    const { productId, productName, quantity, message, targetBranchId, targetBranchName } = data;

    // Validate request data
    if (!productId || !quantity || !message || !targetBranchId) {
      return NextResponse.json({ error: "اطلاعات ناقص است" }, { status: 400 });
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

    // You might also want to send an email or notification to the admin
    // This would be implemented based on your notification system

    return NextResponse.json({
      success: true,
      message: "درخواست با موفقیت ثبت شد",
      requestId: requestData.requestId,
    });
  } catch (error) {
    console.error("Error creating product request:", error);
    return NextResponse.json({ error: "خطا در ثبت درخواست" }, { status: 500 });
  }
}
