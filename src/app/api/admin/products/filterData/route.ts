import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db"; // Adjust based on your project structure

/**
 * @swagger
 * /api/admin/products/filterData:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all categories and subcategories
 *     description: Returns all categories and subcategories from the Support.Category and Support.CategoryContent tables.
 *     responses:
 *       200:
 *         description: A list of categories and subcategories.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       CategoryID:
 *                         type: string
 *                       Name:
 *                         type: string
 *                 subCategories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       CategoryContentID:
 *                         type: string
 *                       Name:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    const pool = await connectToDatabase();

    // Fetch Categories
    const categoryQuery = `
      SELECT CategoryID, Name 
      FROM Support.Category;
    `;

    // Fetch SubCategories
    const subCategoryQuery = `
      SELECT CategoryContentID, Name 
      FROM Support.CategoryContent;
    `;

    const categoryResult = await pool.request().query(categoryQuery);
    const subCategoryResult = await pool.request().query(subCategoryQuery);

    return NextResponse.json({
      categories: categoryResult.recordset,
      subCategories: subCategoryResult.recordset,
    });
  } catch (error) {
    console.error("Error fetching categories and subcategories:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
