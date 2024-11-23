import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";

/**
 * @swagger
 * /api/products/getAllProducts:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products with links to category and subcategory
 *     description: Returns a paginated list of products with their associated category and subcategory slugs included in the product links.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number to fetch.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Number of products to return per page.
 *     responses:
 *       200:
 *         description: A paginated list of products with links
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       ProductId:
 *                         type: integer
 *                       Name:
 *                         type: string
 *                       Type:
 *                         type: string
 *                       Price:
 *                         type: number
 *                       Discount:
 *                         type: number
 *                       CategoryContentId:
 *                         type: string
 *                       img1:
 *                         type: string
 *                       img2:
 *                         type: string
 *                       Available:
 *                         type: boolean
 *                       Description:
 *                         type: string
 *                       CategoryId:
 *                         type: integer
 *                       productSlug:
 *                         type: string
 *                       categorySlug:
 *                         type: string
 *                       subCategorySlug:
 *                         type: string
 *                       link:
 *                         type: string
 *                         description: The full URL to the product.
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     totalCount:
 *                       type: integer
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       404:
 *         description: No products found
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);
    const offset = (page - 1) * limit;

    const pool = await connectToDatabase();

    // Count total products
    const totalCountResult = await pool
      .request()
      .query("SELECT COUNT(*) AS totalCount FROM Support.Product");
    const totalCount = totalCountResult.recordset[0].totalCount;
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch products with category and subcategory slugs
    const result = await pool.request().query(`
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
        ORDER BY 
          p.ProductId
        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY
      `);

    if (result.recordset.length === 0) {
      return new NextResponse("No products found", { status: 404 });
    }

    // Add link for each product
    const data = result.recordset.map((product) => ({
      ...product,
      link: `${product.categorySlug}/${product.subCategorySlug}/${product.productSlug}`,
    }));

    const response = {
      data,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching products: ", error);
    return new NextResponse("Failed to fetch products", { status: 500 });
  }
}
