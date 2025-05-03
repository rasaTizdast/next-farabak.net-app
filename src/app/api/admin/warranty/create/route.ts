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
    let branchName = null;
    if (userRole === "Branch") {
      const userId = decoded.userId || decoded.id || decoded.sub;
      const branch = await prisma.$queryRaw`
        SELECT "branchid", "name" FROM "support"."branch"
        WHERE "UserID" = ${Number(userId)}
      `;

      if (!branch || (branch as any[]).length === 0) {
        return NextResponse.json(
          { error: "No branch found for this user" },
          { status: 403 }
        );
      }

      branchId = (branch as any[])[0].branchid;
      branchName = (branch as any[])[0].name;
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

        // If the branch is trying to create a warranty, check if the invoice belongs to them
        if (((invoiceAuth as any[])[0].count as number) === 0) {
          const invoiceBranchCheck = await prisma.$queryRaw`
            SELECT COUNT(*) as count
            FROM "info"."Invoice" i
            WHERE i."Invoiceid" = ${parseInt(invoiceId)}
            AND i."BranchId" = ${branchId}
          `;

          if (((invoiceBranchCheck as any[])[0].count as number) === 0) {
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
    }

    // Verify the branch has stock of this product if we're not using an existing inventory item
    const selectedBranchId = warrantyData.branchId || branchId;
    if (!selectedBranchId) {
      return NextResponse.json(
        { error: "Branch ID is required" },
        { status: 400 }
      );
    }

    // Get branch name if needed
    let selectedBranchName = branchName;
    if (!selectedBranchName) {
      const branchInfo = await prisma.$queryRaw`
        SELECT "name" FROM "support"."branch"
        WHERE "branchid" = ${selectedBranchId}
      `;

      if (branchInfo && (branchInfo as any[]).length > 0) {
        selectedBranchName = (branchInfo as any[])[0].name;
      }
    }

    // For dontReduceStock case, we need to check if the invoice has this product
    if (warrantyData.dontReduceStock) {
      // Check if the invoice actually has this product
      const invoiceProductCheck = await prisma.$queryRaw`
        SELECT COUNT(*) as count
        FROM "info"."Invoice_Details" id
        WHERE id."Invoiceid" = ${parseInt(invoiceId)}
        AND id."ProductId" = ${parseInt(productId)}
      `;

      const hasProduct =
        ((invoiceProductCheck as any[])[0].count as number) > 0;

      if (!hasProduct) {
        return NextResponse.json(
          { error: "The invoice does not contain this product" },
          { status: 400 }
        );
      }
    } else {
      // If we're not using the dontReduceStock flow, check branch stock
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
    }

    // Create warranty record - now use conditional logic for stock reduction
    let newWarranty;

    // Create the warranty data object
    // The schema doesn't appear to have a branchname field, so we'll remove it
    const warrantyCreateData = {
      userid: invoice.UserId || 0,
      invoicedetailid: parseInt(invoiceDetailId),
      branchid: selectedBranchId,
      // Don't include branchname as it's not in the schema
      warrantycode: warrantyData.warrantycode,
      ProductId: parseInt(productId),
      startdate: warrantyData.startdate,
      expirydate: warrantyData.expirydate,
      status: determineWarrantyStatus(warrantyData.expirydate),
    };

    if (warrantyData.dontReduceStock) {
      // If we're using an item from an invoice, don't reduce stock
      newWarranty = await prisma.warranty.create({
        data: warrantyCreateData,
      });
    } else {
      // The traditional way - reduce stock when creating warranty
      const branchProduct = await prisma.branchproduct.findFirst({
        where: {
          branchid: selectedBranchId,
          ProductId: parseInt(productId),
        },
      });

      // Start a transaction to create warranty and update stock atomically
      [newWarranty] = await prisma.$transaction([
        // Create warranty record
        prisma.warranty.create({
          data: warrantyCreateData,
        }),

        // Decrease product quantity in branch
        prisma.branchproduct.update({
          where: {
            branchproductid: branchProduct!.branchproductid,
          },
          data: {
            quantity: {
              decrement: 1,
            },
          },
        }),
      ]);
    }

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
