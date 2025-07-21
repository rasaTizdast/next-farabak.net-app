import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/products/getCategoryName/{categoryName}:
 *   get:
 *     description: Fetch the category name based on the category slug
 *     tags:
 *       - Products
 *     summary: Get Category name by Category slug
 *     parameters:
 *       - name: categoryName
 *         in: path
 *         required: true
 *         description: The slug of the category to retrieve the category name for
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
 *                 categoryName:
 *                   type: string
 *                   example: "home-edition"
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
  props: { params: Promise<{ categoryName: string }> }
) {
  const params = await props.params;
  const categoryNameSlug = params.categoryName;

  try {
    // Retrieve the category name based on the slug from the Support.Category table
    const category = await prisma.category.findFirst({
      where: { Slug: categoryNameSlug },
      select: { Name: true },
    });

    // If no category is found, return a 404 error
    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Return the category name in the response
    return NextResponse.json({ categoryName: category.Name });
  } catch (error) {
    return new NextResponse("Failed to fetch category name", {
      status: 500,
    });
  }
}
