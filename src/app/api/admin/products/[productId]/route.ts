import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @swagger
 * /api/admin/products/{productId}:
 *   delete:
 *     summary: Remove a product and its related data
 *     description: |
 *       Deletes a product from multiple tables: Product, ProductOverview,
 *       ProductOverviewDetails, ProductSpecs, and FAQs.
 *     tags:
 *       - Admin
 *     parameters:
 *       - name: productId
 *         in: path
 *         required: true
 *         description: The ID of the product to remove.
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully removed product and related data.
 *       401:
 *         description: Unauthorized. The user is not logged in or does not have admin access.
 *       404:
 *         description: Product not found.
 *       500:
 *         description: Internal server error.
 */
async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string } }
): Promise<NextResponse> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const userRole = decoded.role;

    if (!userRole || userRole !== "Admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { productId } = params;

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Check if the product exists in the database
    const productExists = await prisma.product.findUnique({
      where: { ProductId: parseInt(productId, 10) },
    });

    if (!productExists) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Start a transaction to delete from multiple tables
    try {
      await prisma.$transaction([
        prisma.product.delete({
          where: { ProductId: parseInt(productId, 10) },
        }),
        prisma.productOverview.deleteMany({
          where: { ProductId: parseInt(productId, 10) },
        }),
        prisma.details_ProductOverviewDetails.deleteMany({
          where: { productid: parseInt(productId, 10) },
        }),
        prisma.productSpecs.deleteMany({
          where: { ProductId: parseInt(productId, 10) },
        }),
        prisma.fAQs.deleteMany({
          where: { ProductId: parseInt(productId, 10) },
        }),
      ]);

      return NextResponse.json(
        { message: "Product and related data removed successfully." },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error removing product and related data: ", error);
      return NextResponse.json(
        { message: "Failed to remove product and related data" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in DELETE request:", error);
    return NextResponse.json(
      { message: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
