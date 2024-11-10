import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";

/**
 * @swagger
 * /api/products/getProductsByCategory/{categoryName}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get products by category name with pagination
 *     description: Returns a paginated list of products filtered by category name.
 *     parameters:
 *       - in: path
 *         name: categoryName
 *         required: true
 *         schema:
 *           type: string
 *         description: The category name (slug) to filter products by.
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
 *           default: 10
 *         description: Number of products to return per page.
 *     responses:
 *       200:
 *         description: A paginated list of filtered products
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
 *                         nullable: true
 *                       Discount:
 *                         type: number
 *                         nullable: true
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
export async function GET(
  req: Request,
  { params }: { params: { categoryName: string } }
) {
  const categoryName = params.categoryName;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const offset = (page - 1) * limit;

    const pool = await connectToDatabase();

    // Retrieve CategoryId based on categoryName from the Support.Category table
    const categoryIdResult = await pool
      .request()
      .input("slug", categoryName)
      .query("SELECT CategoryId FROM Support.Category WHERE slug = @slug");

    if (categoryIdResult.recordset.length === 0) {
      return new NextResponse("Category not found", { status: 404 });
    }

    const categoryId = categoryIdResult.recordset[0].CategoryId;

    // Count total products in the category
    const totalCountResult = await pool
      .request()
      .input("categoryId", categoryId)
      .query(
        "SELECT COUNT(*) AS totalCount FROM Support.Product WHERE CategoryId = @categoryId"
      );
    const totalCount = totalCountResult.recordset[0].totalCount;
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch paginated products in the category
    const result = await pool
      .request()
      .input("categoryId", categoryId)
      .query(
        `SELECT * FROM Support.Product 
         WHERE CategoryId = @categoryId 
         ORDER BY ProductId 
         OFFSET ${offset} ROWS 
         FETCH NEXT ${limit} ROWS ONLY`
      );

    if (result.recordset.length === 0) {
      return new NextResponse("No products found for this category", {
        status: 404,
      });
    }

    const response = {
      data: result.recordset,
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
    console.error("Error fetching products by category: ", error);
    return new NextResponse("Failed to fetch products by category", {
      status: 500,
    });
  }
}
