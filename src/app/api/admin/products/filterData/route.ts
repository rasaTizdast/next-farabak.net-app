import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/admin/products/filterData:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get categories with subcategories
 *     description: Returns all categories with their corresponding subcategories from the Support.Category and Support.CategoryContent tables.
 *     responses:
 *       200:
 *         description: A list of categories with subcategories.
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
 *                       subCategories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             CategoryContentID:
 *                               type: string
 *                             Name:
 *                               type: string
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        CategoryContent: true,
      },
      orderBy: {
        Name: 'asc',
      },
    });

    const formattedCategories = categories.map((category) => ({
      CategoryID: category.CategoryID,
      Name: category.Name,
      subCategories: category.CategoryContent.map((subCategory) => ({
        CategoryContentID: subCategory.CategoryContentId,
        Name: subCategory.Name,
      })),
    }));

    return NextResponse.json({ categories: formattedCategories });
  } catch (error) {
    console.error("Error fetching categories and subcategories:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
