import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";

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

    // Fetch category SEO details
    const seoCategoriesResult = await pool.request().query(`
      SELECT 
        CategoryID, 
        SEO_Title, 
        SEO_Description, 
        SEO_Keywords
      FROM 
        Support.SEO_Category
    `);
    const seoCategories = seoCategoriesResult.recordset;

    // Fetch subcategory SEO details
    const seoSubcategoriesResult = await pool.request().query(`
      SELECT 
        CategoryContentId, 
        SEO_Title, 
        SEO_Description, 
        SEO_Keywords
      FROM 
        Support.SEO_CategoryContent
    `);
    const seoSubcategories = seoSubcategoriesResult.recordset;

    // Map subcategories with SEO and parent category slug
    const subcategoriesWithSEO = subcategories.map((sub) => {
      const seoDetails = seoSubcategories.find(
        (seo) => seo.CategoryContentId === sub.CategoryContentId
      );

      // Find parent category slug for the subcategory
      const parentCategory = categories.find(
        (category) => category.CategoryID === sub.CategoryID
      );

      return {
        ...sub,
        Link: parentCategory
          ? `/products/${parentCategory.Slug}/${sub.Slug}`
          : `/products/${sub.Slug}`, // Fallback if parent category not found
        SEO_Details: seoDetails || {
          SEO_Title: null,
          SEO_Description: null,
          SEO_Keywords: null,
        },
      };
    });

    // Map subcategories and SEO data to categories
    const categoriesWithSubcategoriesAndSEO = categories.map((category) => {
      const relatedSubcategories = subcategoriesWithSEO.filter(
        (sub) => sub.CategoryID === category.CategoryID
      );

      const seoDetails = seoCategories.find(
        (seo) => seo.CategoryID === category.CategoryID
      );

      return {
        ...category,
        Link: `/products/${category.Slug}`,
        SEO_Details: seoDetails || {
          SEO_Title: null,
          SEO_Description: null,
          SEO_Keywords: null,
        },
        Subcategories: relatedSubcategories,
      };
    });

    return NextResponse.json(categoriesWithSubcategoriesAndSEO);
  } catch (error) {
    console.error("Error fetching categories and subcategories: ", error);
    return new NextResponse("Failed to fetch categories", { status: 500 });
  }
}
