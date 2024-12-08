import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import { escape } from "validator";

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     tags:
 *       - Admin
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
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for filtering products by description keywords.
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Filter by category ID.
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: integer
 *         description: Filter by subcategory ID.
 *       - in: query
 *         name: available
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *         description: Filter by availability status (true/false). Use 'all' to return both.
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
 *                         type: array
 *                         items:
 *                           type: string
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
 *                       categoryName:
 *                         type: string
 *                       subCategoryName:
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
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const query = searchParams.get("q") || "";
  const category = parseInt(searchParams.get("category") || "0", 10);
  const subcategory = searchParams.get("subcategory") || "";
  const available = searchParams.get("available");
  const offset = (page - 1) * limit;

  try {
    const pool = await connectToDatabase();

    // Base SQL query
    let sqlQuery = `SELECT 
          p.ProductId,
          p.Name AS productName,
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
          c.Name AS categoryName,
          cc.Name AS subCategoryName
        FROM Support.Product p
        JOIN Support.Category c ON c.CategoryId = p.CategoryId
        OUTER APPLY (
          SELECT TOP 1 cc.Slug, cc.Name
          FROM Support.CategoryContent cc
          WHERE CHARINDEX(CAST(cc.CategoryContentId AS VARCHAR), p.CategoryContentId) > 0
        ) AS cc`;

    let countQuery = `SELECT COUNT(*) AS totalCount
        FROM Support.Product p
        JOIN Support.Category c ON c.CategoryId = p.CategoryId
        OUTER APPLY (
          SELECT TOP 1 cc.Slug
          FROM Support.CategoryContent cc
          WHERE CHARINDEX(CAST(cc.CategoryContentId AS VARCHAR), p.CategoryContentId) > 0
        ) AS cc`;

    const conditions: string[] = [];

    if (query.trim()) {
      const keywords = escape(query.trim()).split(/\s+/);
      keywords.forEach((keyword, index) => {
        conditions.push(`p.Description LIKE @keyword${index}`);
      });
    }

    if (category > 0) {
      conditions.push(`p.CategoryId = @category`);
    }

    if (subcategory) {
      const subcategoryIds = subcategory.split(",");
      subcategoryIds.forEach((id, index) => {
        conditions.push(
          `CHARINDEX(@subcategory${index}, p.CategoryContentId) > 0`
        );
      });
    }

    if (available && available !== "all") {
      conditions.push(`p.Available = @available`);
    }

    if (conditions.length > 0) {
      const whereClause = ` WHERE ${conditions.join(" AND ")}`;
      sqlQuery += whereClause;
      countQuery += whereClause;
    }

    sqlQuery += ` ORDER BY p.ProductId
        OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`;

    const requestQuery = pool.request();
    const countQueryRequest = pool.request();

    if (query.trim()) {
      const keywords = escape(query.trim()).split(/\s+/);
      keywords.forEach((keyword, index) => {
        requestQuery.input(`keyword${index}`, `%${keyword}%`);
        countQueryRequest.input(`keyword${index}`, `%${keyword}%`);
      });
    }

    if (category > 0) {
      requestQuery.input("category", category);
      countQueryRequest.input("category", category);
    }

    if (subcategory) {
      const subcategoryIds = subcategory.split(",");
      subcategoryIds.forEach((id, index) => {
        requestQuery.input(`subcategory${index}`, id);
        countQueryRequest.input(`subcategory${index}`, id);
      });
    }

    if (available && available !== "all") {
      const availability = available === "true";
      requestQuery.input("available", availability);
      countQueryRequest.input("available", availability);
    }

    const result = await requestQuery.query(sqlQuery);
    const totalCountResult = await countQueryRequest.query(countQuery);

    const totalCount = totalCountResult.recordset[0].totalCount;
    const totalPages = Math.ceil(totalCount / limit);

    if (result.recordset.length === 0) {
      return new NextResponse("No products found", { status: 404 });
    }

    // Get the names of the category content items
    const categoryContentIds = result.recordset.flatMap((product) =>
      product.CategoryContentId.toString()
        .split(",")
        .map((id: string) => id.trim())
    );
    const uniqueCategoryContentIds = Array.from(new Set(categoryContentIds)); // No use of `set` here

    // Fetch names for all unique CategoryContentIds
    const categoryContentQuery = `
      SELECT CategoryContentId, Name
      FROM Support.CategoryContent
      WHERE CategoryContentId IN (${uniqueCategoryContentIds.join(",")})
    `;
    const categoryContentResult = await pool
      .request()
      .query(categoryContentQuery);
    const categoryContentMap = categoryContentResult.recordset.reduce(
      (map, row) => {
        map[row.CategoryContentId] = row.Name;
        return map;
      },
      {}
    );

    const data = result.recordset.map((product) => {
      const categoryContentIds = product.CategoryContentId.toString()
        .split(",")
        .map((id: string) => id.trim());

      const categoryContentDetails = categoryContentIds.map((id: string) => ({
        CategoryContentId: id,
        Name: categoryContentMap[id] || "Unknown",
      }));

      return {
        ...product,
        CategoryContentId: categoryContentIds,
        CategoryContentIds: categoryContentDetails,
        link: `${product.categorySlug}/${product.subCategorySlug}/${product.productSlug}`,
      };
    });

    return NextResponse.json({
      data,
      pagination: {
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new NextResponse("Failed to fetch products", { status: 500 });
  }
}
