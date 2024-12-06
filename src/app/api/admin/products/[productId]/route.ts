import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";
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

    const pool = await connectToDatabase(); // Make sure pool is initialized here
    const request = pool.request();

    // Check if the product exists in the database
    const productExists = await request
      .input("id", productId)
      .query(
        "SELECT COUNT(*) AS count FROM Support.Product WHERE ProductId = @id"
      );

    if (productExists.recordset[0].count === 0) {
      return NextResponse.json(
        { message: "Product not found" },
        { status: 404 }
      );
    }

    // Start a transaction to delete from multiple tables
    const transaction = pool.transaction();
    await transaction.begin(); // Start the transaction

    try {
      const transactionRequest = transaction.request();
      transactionRequest.input("id", productId);

      // 1. Delete from Support.Product
      await transactionRequest.query(
        "DELETE FROM Support.Product WHERE ProductId = @id"
      );

      // 2. Delete from Support.ProductOverview
      await transactionRequest.query(
        "DELETE FROM Support.ProductOverview WHERE ProductId = @id"
      );

      // 3. Delete from Support.ProductOverviewDetails (if exists)
      await transactionRequest.query(
        "DELETE FROM Support.ProductOverviewDetails WHERE ProductId = @id"
      );

      // 4. Delete from Support.ProductSpecs
      await transactionRequest.query(
        "DELETE FROM Support.ProductSpecs WHERE ProductId = @id"
      );

      // 5. Delete from Support.FAQs
      await transactionRequest.query(
        "DELETE FROM Support.FAQs WHERE ProductId = @id"
      );

      await transaction.commit(); // Commit the transaction

      return NextResponse.json(
        { message: "Product and related data removed successfully." },
        { status: 200 }
      );
    } catch (error) {
      await transaction.rollback(); // Rollback if something goes wrong
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
