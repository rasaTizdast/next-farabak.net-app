import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";

/**
 * @swagger
 * /api/products/getCategoryName/{categoryName}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get category name by category slug
 *     description: Returns the name of the selected category based on its slug.
 *     parameters:
 *       - in: path
 *         name: categoryName
 *         required: true
 *         schema:
 *           type: string
 *         description: The category slug to fetch the name for.
 *     responses:
 *       200:
 *         description: The name of the selected category
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categoryName:
 *                   type: string
 *                   description: Name of the category
 *       404:
 *         description: Category not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: Request,
  { params }: { params: { categoryName: string } }
) {
  const categoryNameSlug = params.categoryName;

  try {
    const pool = await connectToDatabase();

    // Retrieve the category name based on the slug from the Support.Category table
    const categoryResult = await pool
      .request()
      .input("slug", categoryNameSlug)
      .query("SELECT Name FROM Support.Category WHERE slug = @slug");

    // If no category is found, return a 404 error
    if (categoryResult.recordset.length === 0) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Extract category name from the result
    const categoryName = categoryResult.recordset[0].Name;

    // Return the category name in the response
    return NextResponse.json({ categoryName });
  } catch (error) {
    console.error("Error fetching category name: ", error);
    return new NextResponse("Failed to fetch category name", {
      status: 500,
    });
  }
}
