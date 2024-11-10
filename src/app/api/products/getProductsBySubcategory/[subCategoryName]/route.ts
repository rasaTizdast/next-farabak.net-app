// app/api/products/getProductsBySubcategory/[subCategoryName]/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";

/**
 * @swagger
 * /api/products/getProductsBySubcategory/{subCategoryName}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get products by subcategory name with pagination
 *     description: Returns a paginated list of products filtered by subcategory name.
 *     parameters:
 *       - in: path
 *         name: subCategoryName
 *         required: true
 *         schema:
 *           type: string
 *         description: The subcategory name (slug) to filter products by.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: The number of products per page.
 *     responses:
 *       200:
 *         description: A list of filtered products by subcategory
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: No products found for this subcategory.
 *       500:
 *         description: Internal server error
 */

export async function GET(
  req: Request,
  { params }: { params: { subCategoryName: string } }
) {
  const { searchParams } = new URL(req.url);
  const subCategoryName = params.subCategoryName;

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const offset = (page - 1) * limit;

  try {
    // Attempting to connect to the database
    const pool = await connectToDatabase();

    // Get the subcategory ID based on the provided subCategoryName
    const subCategoryIdResult = await pool
      .request()
      .input("slug", subCategoryName)
      .query(
        "SELECT CategoryContentId FROM Support.CategoryContent WHERE Slug = @slug"
      );

    if (subCategoryIdResult.recordset.length === 0) {
      return new NextResponse("Subcategory not found", { status: 404 });
    }

    const subCategoryId = subCategoryIdResult.recordset[0].CategoryContentId;

    // Count total products for pagination
    const totalResult = await pool
      .request()
      .input("subCategoryId", subCategoryId)
      .query(
        `SELECT COUNT(*) AS count FROM Support.Product 
         WHERE EXISTS (
           SELECT value FROM STRING_SPLIT(CategoryContentId, ',')
           WHERE LTRIM(RTRIM(value)) = @subCategoryId
         )`
      );

    const totalCount = totalResult.recordset[0].count;
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch paginated products
    const result = await pool
      .request()
      .input("subCategoryId", subCategoryId)
      .query(
        `SELECT * FROM Support.Product 
         WHERE EXISTS (
           SELECT value FROM STRING_SPLIT(CategoryContentId, ',')
           WHERE LTRIM(RTRIM(value)) = @subCategoryId
         )
         ORDER BY ProductId
         OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`
      );

    if (result.recordset.length === 0) {
      return new NextResponse("No products found for this subcategory", {
        status: 404,
      });
    }

    return NextResponse.json({
      data: result.recordset,
      pagination: { currentPage: page, totalPages },
    });
  } catch (error) {
    console.error("Error fetching products by subcategory: ", error);
    return new NextResponse("Failed to fetch products by subcategory", {
      status: 500,
    });
  }
}
