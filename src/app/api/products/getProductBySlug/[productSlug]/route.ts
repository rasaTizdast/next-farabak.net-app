// app/api/products/getProductById/[productId]/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";

/**
 * @swagger
 * /api/products/getProductBySlug/{productSlug}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get a product by Slug
 *     description: Returns a specific product based on the product Slug, including category and subcategory slugs.
 *     parameters:
 *       - in: path
 *         name: productSlug
 *         required: true
 *         schema:
 *           type: string
 *         description: The slug of the product to fetch
 *     responses:
 *       200:
 *         description: A specific product
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ProductId:
 *                   type: integer
 *                 Name:
 *                   type: string
 *                 Type:
 *                   type: string
 *                 Price:
 *                   type: number
 *                   nullable: true
 *                 Discount:
 *                   type: number
 *                   nullable: true
 *                 CategoryContentId:
 *                   type: string
 *                 img1:
 *                   type: string
 *                 img2:
 *                   type: string
 *                 Available:
 *                   type: boolean
 *                 Description:
 *                   type: string
 *                 CategoryId:
 *                   type: integer
 *                 categorySlug:
 *                   type: string
 *                 subCategorySlug:
 *                   type: string
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
export async function GET(
  request: Request,
  { params }: { params: { productSlug: string } }
) {
  try {
    // Connect to the database
    const pool = await connectToDatabase();

    // Query to get a product by productSlug, including category and subcategory slugs
    const result = await pool.request().input("ProductSlug", params.productSlug) // Bind the productSlug parameter
      .query(`
        SELECT 
          p.ProductId,
          p.Name,
          p.Type,
          p.Price,
          p.Discount,
          p.CategoryContentId,
          p.img1,
          p.img2,
          p.Available,
          p.Description,
          p.CategoryId,
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
        WHERE 
          p.Slug = @ProductSlug
      `);

    // Check if the product is found
    if (result.recordset.length === 0) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Return the product data as a JSON response
    const product = result.recordset[0];

    return NextResponse.json(product); // Return the first product object with slugs
  } catch (error) {
    console.error("Error fetching product by Slug: ", error);

    // Return a server error response
    return new NextResponse("Failed to fetch product", { status: 500 });
  }
}
