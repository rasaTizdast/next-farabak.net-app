import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";

/**
 * @swagger
 * /api/products/getSubCategoryName/{subCategoryName}:
 *   get:
 *     description: Fetch the category name based on the subcategory slug
 *     tags:
 *       - Products
 *     summary: Get subCategory name by subCategory slug
 *     parameters:
 *       - name: subCategoryName
 *         in: path
 *         required: true
 *         description: The slug of the subcategory to retrieve the category name for
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the category name
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 subCategoryName:
 *                   type: string
 *                   example: "ptz"
 *       404:
 *         description: Category not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Category not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Failed to fetch category name"
 */

export async function GET(
  req: Request,
  { params }: { params: { subCategoryName: string } }
) {
  const subCategoryNameSlug = params.subCategoryName;
  try {
    const pool = await connectToDatabase();

    // Retrieve the subCategory name based on the slug from the Support.CategoryContent table
    const categoryResult = await pool
      .request()
      .input("slug", subCategoryNameSlug)
      .query("SELECT Name FROM Support.CategoryContent WHERE slug = @slug");

    // If no subCategory is found, return a 404 error
    if (categoryResult.recordset.length === 0) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Extract subCategory name from the result
    const subCategoryName = categoryResult.recordset[0].Name;

    // Return the subCategory name in the response
    return NextResponse.json({ subCategoryName });
  } catch (error) {
    console.error("Error fetching category name: ", error);
    return new NextResponse("Failed to fetch category name", {
      status: 500,
    });
  }
}
