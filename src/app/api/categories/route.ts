import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
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
 * /api/categories:
 *   delete:
 *     summary: Deletes a category or subcategory and all related data
 *     description: Deletes a category and all its subcategories, products, and related data, or deletes a subcategory and all its related products and data.
 *     tags: Admin
 *     requestBody:
 *       description: The ID of the category or subcategory to delete.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryId:
 *                 type: string
 *                 description: The ID of the category to delete (optional if subCategoryId is provided).
 *               subCategoryId:
 *                 type: string
 *                 description: The ID of the subcategory to delete (optional if categoryId is provided).
 *             example:
 *               categoryId: "1"  // Example for deleting a category
 *               subCategoryId: "1006"  // Example for deleting a subcategory
 *     responses:
 *       200:
 *         description: Deletion successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Deletion successful."
 *       400:
 *         description: Invalid request, no category or subcategory ID provided
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid request, no category or subcategory ID provided."
 *       500:
 *         description: Error during deletion
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Error during deletion"
 *                 error:
 *                   type: string
 *                   example: "Detailed error message"
 *
 *   patch:
 *     tags:
 *       - Admin
 *     summary: Update category or subcategory
 *     description: Update a category or a subcategory based on the provided ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Type:
 *                 type: string
 *                 description: Either 'category' or 'subcategory'
 *               CategoryID:
 *                 type: integer
 *               CategoryContentId:
 *                 type: string
 *               Name:
 *                 type: string
 *               Slug:
 *                 type: string
 *               Available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successfully updated category or subcategory
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 *
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all categories and their subcategories
 *     description: Returns a list of categories with their associated subcategories.
 *     responses:
 *       200:
 *         description: List of categories with subcategories
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   CategoryID:
 *                     type: integer
 *                   Name:
 *                     type: string
 *                   Available:
 *                     type: boolean
 *                   Slug:
 *                     type: string
 *                   Link:
 *                     type: string
 *                   Subcategories:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         CategoryContentId:
 *                           type: string
 *                         Name:
 *                           type: string
 *                         CategoryID:
 *                           type: integer
 *                         Slug:
 *                           type: string
 *                         Available:
 *                           type: boolean
 *                         Link:
 *                           type: string
 */

export async function GET() {
  try {
    const pool = await connectToDatabase();

    // Fetch categories
    const categoriesResult = await pool.request().query(`
      SELECT 
        CategoryID, 
        Name, 
        Available, 
        Slug
      FROM 
        Support.Category
    `);

    const categories = categoriesResult.recordset;

    // Fetch subcategories
    const subcategoriesResult = await pool.request().query(`
      SELECT 
        CategoryContentId, 
        Name, 
        CategoryID, 
        Slug, 
        Available
      FROM 
        Support.CategoryContent
    `);

    const subcategories = subcategoriesResult.recordset;

    // Map subcategories to their categories
    const categoriesWithSubcategories = categories.map((category) => {
      const relatedSubcategories = subcategories
        .filter((sub) => sub.CategoryID === category.CategoryID)
        .map((sub) => ({
          ...sub,
          Link: `/products/${category.Slug}/${sub.Slug}`,
        }));

      return {
        ...category,
        Link: `/products/${category.Slug}`,
        Subcategories: relatedSubcategories,
      };
    });

    return NextResponse.json(categoriesWithSubcategories);
  } catch (error) {
    console.error("Error fetching categories and subcategories: ", error);
    return new NextResponse("Failed to fetch categories", { status: 500 });
  }
}

export async function PATCH(req: Request) {
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
    const pool = await connectToDatabase();
    const body = await req.json();

    const { Type, CategoryID, CategoryContentId, Name, Slug, Available } = body;

    if (Type === "category") {
      if (!CategoryID || !Name || !Slug || Available === undefined) {
        return NextResponse.json(
          { message: "Invalid data for category" },
          { status: 400 }
        );
      }

      // Update category in the database
      const result = await pool
        .request()
        .input("CategoryID", CategoryID)
        .input("Name", Name)
        .input("Slug", Slug)
        .input("Available", Available).query(`
            UPDATE Support.Category
            SET Name = @Name, Slug = @Slug, Available = @Available
            WHERE CategoryID = @CategoryID
          `);

      if (result.rowsAffected[0] === 0) {
        return NextResponse.json(
          { message: "Category not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: "Category updated successfully" });
    } else if (Type === "subcategory") {
      if (
        !CategoryContentId ||
        !CategoryID ||
        !Name ||
        !Slug ||
        Available === undefined
      ) {
        return NextResponse.json(
          { message: "Invalid data for subcategory" },
          { status: 400 }
        );
      }

      // Update subcategory in the database
      const result = await pool
        .request()
        .input("CategoryContentId", CategoryContentId)
        .input("CategoryID", CategoryID)
        .input("Name", Name)
        .input("Slug", Slug)
        .input("Available", Available).query(`
            UPDATE Support.CategoryContent
            SET Name = @Name, Slug = @Slug, Available = @Available
            WHERE CategoryContentId = @CategoryContentId AND CategoryID = @CategoryID
          `);

      if (result.rowsAffected[0] === 0) {
        return NextResponse.json(
          { message: "Subcategory not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: "Subcategory updated successfully" });
    } else {
      return NextResponse.json({ message: "Invalid Type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating category or subcategory:", error);
    return new NextResponse("Failed to update", { status: 500 });
  }
}

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
