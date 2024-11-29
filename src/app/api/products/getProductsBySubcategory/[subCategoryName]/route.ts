import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";

/**
 * @swagger
 * /api/products/getProductsBySubcategory/{subCategoryName}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get products by subcategory name with pagination
 *     description: Returns a paginated list of products filtered by subcategory name with category and subcategory slugs included in the product links.
 *     parameters:
 *       - in: path
 *         name: subCategoryName
 *         required: true
 *         schema:
 *           type: string
 *         description: The subcategory name (slug) to filter products by.
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: The page number for pagination.
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 30
 *         description: The number of products per page.
 *     responses:
 *       200:
 *         description: A list of filtered products by subcategory
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *       404:
 *         description: No products found for this subcategory.
 *       500:
 *         description: Internal server error
 */

export async function GET(
  req: Request,
  { params }: { params: { subCategoryName: string } }
) {
  const { searchParams } = new URL(req.url);
  const subCategoryName = params.subCategoryName;

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const offset = (page - 1) * limit;

  try {
    // Attempting to connect to the database
    const pool = await connectToDatabase();

    // Get the subcategory ID based on the provided subCategoryName
    const subCategoryIdResult = await pool
      .request()
      .input("slug", subCategoryName)
      .query(
        "SELECT CategoryContentId FROM Support.CategoryContent WHERE Slug = @slug"
      );

    if (subCategoryIdResult.recordset.length === 0) {
      return new NextResponse("Subcategory not found", { status: 404 });
    }

    const subCategoryId = subCategoryIdResult.recordset[0].CategoryContentId;

    // Count total products for pagination
    const totalResult = await pool
      .request()
      .input("subCategoryId", subCategoryId)
      .query(
        `SELECT COUNT(*) AS count FROM Support.Product 
         WHERE EXISTS (
           SELECT value FROM STRING_SPLIT(CategoryContentId, ',')
           WHERE LTRIM(RTRIM(value)) = @subCategoryId
         )`
      );

    const totalCount = totalResult.recordset[0].count;
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch paginated products with category and subcategory slugs and SEO details
    const result = await pool
      .request()
      .input("subCategoryId", subCategoryId)
      .query(
        `SELECT 
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
          cc.Slug AS subCategorySlug,
          seo.SEO_Title,
          seo.SEO_Description,
          seo.SEO_Keywords
        FROM 
          Support.Product p
        JOIN 
          Support.Category c ON c.CategoryId = p.CategoryId
        OUTER APPLY (
          SELECT TOP 1 cc.Slug, cc.CategoryContentId
          FROM Support.CategoryContent cc
          WHERE CHARINDEX(CAST(cc.CategoryContentId AS VARCHAR), p.CategoryContentId) > 0
        ) AS cc
        LEFT JOIN
          Support.SEO_CategoryContent seo ON seo.CategoryContentId = cc.CategoryContentId
        WHERE 
        EXISTS (
        SELECT 1
        FROM STRING_SPLIT(p.CategoryContentId, ',') AS splitValues
        WHERE LTRIM(RTRIM(splitValues.value)) = @subCategoryId
    )
        ORDER BY 
          p.ProductId
        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY;
`
      );

    if (result.recordset.length === 0) {
      return new NextResponse("No products found for this subcategory", {
        status: 404,
      });
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
    console.error("Error fetching products by subcategory: ", error);
    return new NextResponse("Failed to fetch products by subcategory", {
      status: 500,
    });
  }
}
