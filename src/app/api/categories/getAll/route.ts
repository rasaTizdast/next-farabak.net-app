export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

/**
 * @swagger
 * /api/categories/getAll:
 *   get:
 *     tags:
 *       - Categories
 *     summary: Get all categories and their subcategories with SEO details
 *     description: Returns a list of categories with their associated subcategories, including SEO details.
 *     responses:
 *       200:
 *         description: List of categories with subcategories and their SEO details
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
 *                   SEO_Details:
 *                     type: object
 *                     properties:
 *                       SEO_Title:
 *                         type: string
 *                       SEO_Description:
 *                         type: string
 *                       SEO_Keywords:
 *                         type: string
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
 *                         SEO_Details:
 *                           type: object
 *                           properties:
 *                             SEO_Title:
 *                               type: string
 *                             SEO_Description:
 *                               type: string
 *                             SEO_Keywords:
 *                               type: string
 */

export async function GET() {
  try {
    // Fetch categories
    const categories = await prisma.category.findMany({
      orderBy: {
        CategoryID: "asc", // Ensures categories are ordered by CategoryID in ascending order
      },
      include: {
        SEO_Category: true,
        CategoryContent: {
          include: {
            SEO_CategoryContent: true,
          },
        },
      },
    });

    // Map subcategories with SEO and parent category slug
    const categoriesWithSubcategoriesAndSEO = categories.map((category) => {
      const subcategoriesWithSEO = category.CategoryContent.map((sub) => {
        return {
          ...sub,
          Link: `/products/${category.Slug}/${sub.Slug}`,
          SEO_Details: sub.SEO_CategoryContent[0] || {
            SEO_Title: null,
            SEO_Description: null,
            SEO_Keywords: null,
          },
        };
      });

      return {
        ...category,
        Link: `/products/${category.Slug}`,
        SEO_Details: category.SEO_Category[0] || {
          SEO_Title: null,
          SEO_Description: null,
          SEO_Keywords: null,
        },
        Subcategories: subcategoriesWithSEO,
      };
    });

    return NextResponse.json(categoriesWithSubcategoriesAndSEO);
  } catch (error) {
    console.error("Error fetching categories and subcategories: ", error);
    return new NextResponse("Failed to fetch categories", { status: 500 });
  }
}
