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

    // Only admin or branch users can manage warranties
    if (!userRole || (userRole !== "Admin" && userRole !== "Branch")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get request data
    const { invoiceId, invoiceDetailId, productId, warrantyData } =
      await request.json();

    if (!warrantyData || !warrantyData.warrantycode) {
      return NextResponse.json(
        { error: "Missing warranty data" },
        { status: 400 }
      );
    }

    // For branch users, verify they can only update warranties for their own branch
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

      const branchId = (branch as any[])[0].branchid;

      // Verify that this warranty belongs to the branch
      if (warrantyData.warrantyid) {
        const warranty = await prisma.warranty.findUnique({
          where: { warrantyid: parseInt(warrantyData.warrantyid) },
        });

        if (!warranty || warranty.branchid !== branchId) {
          return NextResponse.json(
            { error: "You are not authorized to update this warranty" },
            { status: 403 }
          );
        }
      }
    }

    // Get the current warranty to check if branch is changing
    const currentWarranty = await prisma.warranty.findUnique({
      where: { warrantyid: parseInt(warrantyData.warrantyid) },
    });

    if (!currentWarranty) {
      return NextResponse.json(
        { error: "Warranty not found" },
        { status: 404 }
      );
    }

    // Check if branch is being changed
    const isBranchChanging =
      warrantyData.branchId &&
      currentWarranty.branchid !== warrantyData.branchId;

    // If branch is changing, verify new branch has stock
    if (isBranchChanging) {
      const newBranchProduct = await prisma.branchproduct.findFirst({
        where: {
          branchid: warrantyData.branchId,
          ProductId: currentWarranty.ProductId,
        },
      });

      if (
        !newBranchProduct ||
        newBranchProduct.quantity === null ||
        newBranchProduct.quantity <= 0
      ) {
        return NextResponse.json(
          { error: "The selected branch does not have this product in stock" },
          { status: 400 }
        );
      }

      // Start a transaction to update warranty, decrement new branch and increment old branch
      const [updatedWarranty] = await prisma.$transaction([
        // Update the warranty
        prisma.warranty.update({
          where: { warrantyid: parseInt(warrantyData.warrantyid) },
          data: {
            warrantycode: warrantyData.warrantycode,
            startdate: warrantyData.startdate,
            expirydate: warrantyData.expirydate,
            status: determineWarrantyStatus(
              warrantyData.expirydate,
              warrantyData.status
            ),
            branchid: warrantyData.branchId,
          },
        }),

        // Decrement product in new branch
        prisma.branchproduct.update({
          where: { branchproductid: newBranchProduct.branchproductid },
          data: {
            quantity: {
              decrement: 1,
            },
          },
        }),

        // Find and update old branch product - can't use upsert with composite key
        prisma.$queryRaw`
          UPDATE "support"."branchproduct" 
          SET "quantity" = "quantity" + 1
          WHERE "branchid" = ${currentWarranty.branchid}
          AND "ProductId" = ${currentWarranty.ProductId}
        `,
      ]);

      return NextResponse.json({
        message: "Warranty updated successfully",
        warranty: updatedWarranty,
      });
    } else {
      // No branch change, just update the warranty
      const updatedWarranty = await prisma.warranty.update({
        where: { warrantyid: parseInt(warrantyData.warrantyid) },
        data: {
          warrantycode: warrantyData.warrantycode,
          startdate: warrantyData.startdate,
          expirydate: warrantyData.expirydate,
          status: determineWarrantyStatus(
            warrantyData.expirydate,
            warrantyData.status
          ),
        },
      });

      return NextResponse.json({
        message: "Warranty updated successfully",
        warranty: updatedWarranty,
      });
    }
  } catch (error) {
    console.error("Error updating warranty:", error);
    return NextResponse.json(
      { error: "Failed to update warranty" },
      { status: 500 }
    );
  }
}

// Helper function to determine warranty status based on expiry date
function determineWarrantyStatus(
  expiryDate: string,
  providedStatus: string
): string {
  // Compare expiry date with current date
  const currentDate = new Date();
  const expiry = new Date(expiryDate);

  if (expiry < currentDate) {
    return "Expired";
  } else {
    return "Active";
  }
}
