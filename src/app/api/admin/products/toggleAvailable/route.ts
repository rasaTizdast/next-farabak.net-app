import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @swagger
 * /api/admin/products/toggleAvailable:
 *   patch:
 *     summary: Toggle product availability
 *     description: Updates the "available" field of a product for a given product ID. Requires an "Admin" role.
 *     tags:
 *       - Admin
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: The ID of the product to toggle availability.
 *     responses:
 *       200:
 *         description: Successfully toggled product availability.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Success message.
 *                 productId:
 *                   type: integer
 *                   description: The product ID.
 *                 available:
 *                   type: boolean
 *                   description: The updated availability status.
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

export async function PATCH(req: Request): Promise<NextResponse> {
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

    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { message: "Product ID is required" },
        { status: 400 }
      );
    }

    // Fetch current availability status
    const product = await prisma.product.findUnique({
      where: { ProductId: productId },
    });

    if (!product) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    const newStatus = !product.Available;

    // Update the availability status
    const updatedProduct = await prisma.product.update({
      where: { ProductId: productId },
      data: { Available: newStatus },
    });

    return NextResponse.json(
      {
        message: "Product availability updated successfully",
        productId: updatedProduct.ProductId,
        available: updatedProduct.Available,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling product availability: ", error);
    return NextResponse.json(
      { message: "Failed to toggle product availability" },
      { status: 500 }
    );
  }
}
