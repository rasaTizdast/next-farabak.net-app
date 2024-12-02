import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";

/**
 * @swagger
 * /api/sitemap/products:
 *   get:
 *     tags:
 *       - sitemap
 *     summary: Get all product URLs for sitemap
 *     description: Returns a list of all product URLs, including category, subcategory, and product slugs for generating a sitemap.
 *     responses:
 *       200:
 *         description: A list of product URLs for the sitemap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 urls:
 *                   type: array
 *                   items:
 *                     type: string
 *                     description: The URL for a product
 *       404:
 *         description: No products found
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    const pool = await connectToDatabase();

    // Fetch products with category and subcategory slugs
    const result = await pool.request().query(`
      SELECT 
        p.Slug AS productSlug,
        c.Slug AS categorySlug,
        cc.Slug AS subCategorySlug
      FROM 
        Support.Product p
      JOIN 
        Support.Category c ON c.CategoryId = p.CategoryId
      OUTER APPLY (
        SELECT TOP 1 cc.Slug 
        FROM Support.CategoryContent cc
        WHERE CHARINDEX(CAST(cc.CategoryContentId AS VARCHAR), p.CategoryContentId) > 0
      ) AS cc
    `);

    if (result.recordset.length === 0) {
      return new NextResponse("No products found", { status: 404 });
    }

    // Map product data to URLs
    const urls = result.recordset.map(
      ({ productSlug, categorySlug, subCategorySlug }) =>
        `https://farabak.net/products/${categorySlug}/${subCategorySlug}/${productSlug}`
    );

    return NextResponse.json({ urls });
  } catch (error) {
    console.error("Error generating sitemap: ", error);
    return new NextResponse("Failed to generate sitemap", { status: 500 });
  }
}
