import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function POST(request: Request) {
  try {
    // Auth check
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const userRole = decoded.role;

    // Only admin or branch users can manage warranties
    if (!userRole || (userRole !== "Admin" && userRole !== "Branch")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get branch ID for the user if they are a branch user
    let branchId = null;
    if (userRole === "Branch") {
      const userId = decoded.userId || decoded.id || decoded.sub;
      const branch = await prisma.$queryRaw`
        SELECT "branchid" FROM "support"."branch"
        WHERE "UserID" = ${Number(userId)}
      `;

      if (!branch || (branch as any[]).length === 0) {
        return NextResponse.json(
          { error: "No branch found for this user" },
          { status: 403 }
        );
      }

      branchId = (branch as any[])[0].branchid;
    }

    // Get request data
    const { invoiceId, invoiceDetailId, productId, warrantyData } =
      await request.json();

    if (!invoiceId || !invoiceDetailId || !productId || !warrantyData) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (
      !warrantyData.warrantycode ||
      !warrantyData.startdate ||
      !warrantyData.expirydate
    ) {
      return NextResponse.json(
        { error: "Missing warranty details" },
        { status: 400 }
      );
    }

    // Get user ID from invoice
    const invoice = await prisma.invoice.findUnique({
      where: { Invoiceid: parseInt(invoiceId) },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // For branch users, verify they can only create warranties for their own branch
    if (userRole === "Branch" && branchId) {
      // Check if branch user is authorized for this invoice detail
      const isAuthorized = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM "info"."warranty" w
        WHERE w."branchid" = ${branchId}
        AND w."invoicedetailid" = ${invoiceDetailId}
      `;

      // If no existing warranty for this branch, check if they're authorized for any warranty on this invoice
      if (((isAuthorized as any[])[0].count as number) === 0) {
        const invoiceAuth = await prisma.$queryRaw`
          SELECT COUNT(*) as count
          FROM "info"."warranty" w
          JOIN "info"."Invoice_Details" id ON w."invoicedetailid" = id."Invoice_Details"
          WHERE w."branchid" = ${branchId}
          AND id."Invoiceid" = ${parseInt(invoiceId)}
        `;

        if (((invoiceAuth as any[])[0].count as number) === 0) {
          return NextResponse.json(
            {
              error:
                "You are not authorized to create a warranty for this invoice",
            },
            { status: 403 }
          );
        }
      }
    }

    // Verify the branch has stock of this product
    const selectedBranchId = warrantyData.branchId || branchId;
    if (!selectedBranchId) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      );
    }

    const branchProduct = await prisma.branchproduct.findFirst({
      where: {
        branchid: selectedBranchId,
        ProductId: parseInt(productId),
      },
    });

    if (
      !branchProduct ||
      branchProduct.quantity === null ||
      branchProduct.quantity <= 0
    ) {
      return NextResponse.json(
        { error: "The selected branch does not have this product in stock" },
        { status: 400 }
      );
    }

    // Start a transaction to create warranty and update stock atomically
    const [newWarranty] = await prisma.$transaction([
      // Create warranty record
      prisma.warranty.create({
        data: {
          userid: invoice.UserId || 0,
          invoicedetailid: parseInt(invoiceDetailId),
          branchid: selectedBranchId,
          warrantycode: warrantyData.warrantycode,
          ProductId: parseInt(productId),
          startdate: warrantyData.startdate,
          expirydate: warrantyData.expirydate,
          status: determineWarrantyStatus(warrantyData.expirydate),
        },
      }),

      // Decrease product quantity in branch
      prisma.branchproduct.update({
        where: {
          branchproductid: branchProduct.branchproductid,
        },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      }),
    ]);

    return NextResponse.json(
      {
        message: "Warranty created successfully",
        warranty: newWarranty,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating warranty:", error);
    return NextResponse.json(
      { error: "Failed to create warranty" },
      { status: 500 }
    );
  }
}

// Helper function to determine warranty status based on expiry date
function determineWarrantyStatus(expiryDate: string): string {
  // Compare expiry date with current date
  const currentDate = new Date();
  const expiry = new Date(expiryDate);

  if (expiry < currentDate) {
    return "Expired";
  } else {
    return "Active";
  }
}
