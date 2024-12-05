import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import { escape } from "validator";

/**
 * @swagger
 * /api/products/search:
 *   get:
 *     tags:
 *       - Products
 *     summary: Search for products by description keywords with optional pagination
 *     description: Returns a list of products that match the search input. If limit is null, all results are returned.
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         description: Search query containing keywords separated by spaces.
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         required: false
 *         description: Page number for pagination.
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: Number of items per page. If null, all results are returned.
 *         schema:
 *           type: integer
 *           nullable: true
 *     responses:
 *       200:
 *         description: A list of matching products with optional pagination
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
 *       400:
 *         description: Invalid search query
 *       404:
 *         description: No matching products found
 *       500:
 *         description: Internal server error
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limitParam = searchParams.get("limit");
  const limit = limitParam !== null ? parseInt(limitParam, 10) : 0; // Default to 0 for no limit
  const offset = (page - 1) * (limit > 0 ? limit : 0); // Offset is meaningful only if limit > 0

  if (!query || query.trim().length === 0) {
    return NextResponse.json(
      { error: "Invalid search query" },
      { status: 400 }
    );
  }

  const keywords = escape(query.trim()).split(/\s+/);

  try {
    const pool = await connectToDatabase();

    // Build dynamic SQL query with category and subcategory slugs
    const sqlQuery = `
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
      FROM Support.Product p
      JOIN Support.Category c ON c.CategoryId = p.CategoryId
      OUTER APPLY (
        SELECT TOP 1 cc.Slug 
        FROM Support.CategoryContent cc
        WHERE CHARINDEX(CAST(cc.CategoryContentId AS VARCHAR), p.CategoryContentId) > 0
      ) AS cc
      WHERE ${keywords
        .map((_, index) => `p.Description LIKE @keyword${index}`)
        .join(" OR ")}
      ${
        limit > 0
          ? `ORDER BY p.ProductId OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`
          : ""
      }
    `;

    const request = pool.request();
    keywords.forEach((keyword, index) => {
      request.input(`keyword${index}`, `%${keyword}%`);
    });

    const result = await request.query(sqlQuery);

    if (result.recordset.length === 0) {
      return new NextResponse("No matching products found", { status: 404 });
    }

    // Fetch total count for pagination, if limit is applied
    let totalCount = null;
    let totalPages = null;

    if (limit > 0) {
      const totalCountResult = await pool
        .request()
        .query(`SELECT COUNT(*) AS totalCount FROM Support.Product`);
      totalCount = totalCountResult.recordset[0].totalCount;
      totalPages = Math.ceil(totalCount / limit);
    }

    // Add link for each product, including categorySlug and subCategorySlug
    const data = result.recordset.map((product) => ({
      ...product,
      link: `${product.categorySlug}/${product.subCategorySlug}/${product.productSlug}`,
    }));

    return NextResponse.json({
      data,
      pagination: {
        totalCount: totalCount || result.recordset.length, // Use recordset length if totalCount is null
        currentPage: page,
        totalPages: totalPages || 1, // Default to 1 page
        hasNextPage:
          limit > 0 && totalPages !== null ? page < totalPages : false, // False if no limit
        hasPrevPage: limit > 0 && page > 1, // True only if limit > 0 and currentPage > 1
      },
    });
  } catch (error) {
    console.error("Error fetching products: ", error);
    return new NextResponse("Failed to search products", { status: 500 });
  }
}
