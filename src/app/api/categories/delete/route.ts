import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import { ConnectionPool } from "mssql"; // Assuming you're using mssql library

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

/**
 * @swagger
 * /api/categories/delete:
 *   delete:
 *     summary: Delete a category or subcategory along with associated products and SEO data.
 *     description: Deletes a category or subcategory and all related data, including products, product details, and SEO entries. This endpoint is restricted to Admin users.
 *     tags:
 *       - Categories
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *                 description: The ID of the category to delete.
 *               subCategoryId:
 *                 type: string
 *                 description: The ID of the subcategory to delete.
 *             oneOf:
 *               - required: [categoryId]
 *               - required: [subCategoryId]
 *           example:
 *             categoryId: "123"
 *     responses:
 *       200:
 *         description: Deletion successful.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Deletion successful.
 *       400:
 *         description: Invalid request when no category or subcategory ID is provided.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid request, no category or subcategory ID provided.
 *       401:
 *         description: Unauthorized access due to missing or invalid token, or insufficient permissions.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Unauthorized
 *       500:
 *         description: Internal server error during deletion process.
 *         content:
 *           application/json:
 *             schema:
 *               type: string
 *               example: Error during deletion
 */

// Helper function to delete a subcategory and related data
async function deleteSubCategory(pool: ConnectionPool, subCategoryId: string) {
  // Delete related SEO details for subCategory
  await pool.request().input("subCategoryId", subCategoryId) // Bind parameter
    .query(`
      DELETE FROM Support.SEO_CategoryContent WHERE CategoryContentId = @subCategoryId
    `);

  // Delete products that are associated with the subCategory
  const products = await pool.request().input("subCategoryId", subCategoryId) // Bind parameter
    .query(`
      SELECT ProductId, CategoryContentId FROM Support.Product WHERE CategoryContentId LIKE '%' + @subCategoryId + '%'
    `);

  for (const product of products.recordset) {
    // Delete product overview
    await pool.request().input("productId", product.ProductId) // Bind parameter
      .query(`
        DELETE FROM Support.ProductOverview WHERE ProductId = @productId
      `);
    await pool.request().input("productId", product.ProductId) // Bind parameter
      .query(`
        DELETE FROM Support.ProductOverviewDetails WHERE ProductId = @productId
      `);
    await pool.request().input("productId", product.ProductId) // Bind parameter
      .query(`
        DELETE FROM Support.ProductSpecs WHERE ProductId = @productId
      `);
    await pool.request().input("productId", product.ProductId) // Bind parameter
      .query(`
        DELETE FROM Support.FAQs WHERE ProductId = @productId
      `);
  }

  // Delete products
  await pool.request().input("subCategoryId", subCategoryId) // Bind parameter
    .query(`
      DELETE FROM Support.Product WHERE CategoryContentId LIKE '%' + @subCategoryId + '%'
    `);

  // Finally, delete the subCategory itself
  await pool.request().input("subCategoryId", subCategoryId) // Bind parameter
    .query(`
      DELETE FROM Support.CategoryContent WHERE CategoryContentId = @subCategoryId
    `);
}

// Helper function to delete a category and its subcategories and products
async function deleteCategory(pool: ConnectionPool, categoryId: string) {
  try {
    // Delete SEO details for the category
    await pool.request().input("categoryId", categoryId) // Bind parameter
      .query(`
        DELETE FROM Support.SEO_Category WHERE CategoryID = @categoryId
      `);

    // Fetch all subcategories for the category
    const subCategories = await pool.request().input("categoryId", categoryId) // Bind parameter
      .query(`
        SELECT CategoryContentId FROM Support.CategoryContent WHERE CategoryID = @categoryId
      `);

    // Loop through each subcategory and delete it and its related data
    for (const subCategory of subCategories.recordset) {
      await deleteSubCategory(pool, subCategory.CategoryContentId);
    }

    // Delete the category itself
    await pool.request().input("categoryId", categoryId) // Bind parameter
      .query(`
        DELETE FROM Support.Category WHERE CategoryID = @categoryId
      `);
  } catch (error) {
    console.error("Error during category deletion:", error);
    throw new Error("Failed to delete category.");
  }
}

export async function DELETE(request: Request) {
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

  try {
    const { categoryId, subCategoryId } = await request.json();

    const pool = await connectToDatabase();

    if (categoryId) {
      // If a categoryId is provided, delete the category and its subcategories
      await deleteCategory(pool, categoryId);
    } else if (subCategoryId) {
      // If a subCategoryId is provided, delete the subCategory and related products
      await deleteSubCategory(pool, subCategoryId);
    } else {
      return NextResponse.json(
        { message: "Invalid request, no category or subcategory ID provided." },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: "Deletion successful." });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error during deletion:", error.message);
      return new NextResponse("Error during deletion", { status: 500 });
    } else {
      console.error("Unexpected error:", error);
      return new NextResponse("Unexpected error during deletion", {
        status: 500,
      });
    }
  }
}
