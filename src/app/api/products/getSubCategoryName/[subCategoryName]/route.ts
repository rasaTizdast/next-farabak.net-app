import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
  props: { params: Promise<{ subCategoryName: string }> }
) {
  const params = await props.params;
  const subCategoryNameSlug = params.subCategoryName;
  try {
    // Retrieve the subCategory name based on the slug from the Support.CategoryContent table
    const categoryContent = await prisma.categoryContent.findFirst({
      where: {
        Slug: subCategoryNameSlug,
      },
      select: {
        Name: true,
      },
    });

    // If no subCategory is found, return a 404 error
    if (!categoryContent) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Extract subCategory name from the result
    const subCategoryName = categoryContent.Name;

    // Return the subCategory name in the response
    return NextResponse.json({ subCategoryName });
  } catch (error) {
    return new NextResponse("Failed to fetch category name", {
      status: 500,
    });
  }
}
