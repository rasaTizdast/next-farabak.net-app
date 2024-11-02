// app/api/products/getProductsBySubcategory/[subcategoryId]/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";

/**
 * @swagger
 * /api/products/getProductsBySubcategory/{subcategoryId}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get products by subcategory with pagination
 *     description: Returns a paginated list of products filtered by subcategory ID (CategoryContentId).
 *     parameters:
 *       - in: path
 *         name: subcategoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: The subcategory ID to filter products by.
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
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       404:
 *         description: No products found for this subcategory.
 *       500:
 *         description: Internal server error
 */
export async function GET(
  req: Request,
  { params }: { params: { subcategoryId: string } }
) {
  const { searchParams } = new URL(req.url);
  const subcategoryId = params.subcategoryId;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const offset = (page - 1) * limit;

  try {
    const pool = await connectToDatabase();
    const result = await pool
      .request()
      .input("subcategoryId", subcategoryId)
      .query(
        `SELECT * FROM Support.Product 
         WHERE CategoryContentId LIKE '%' + @subcategoryId + '%' 
         ORDER BY ProductId
         OFFSET ${offset} ROWS FETCH NEXT ${limit} ROWS ONLY`
      );

    const totalResult = await pool
      .request()
      .input("subcategoryId", subcategoryId)
      .query(
        `SELECT COUNT(*) as count FROM Support.Product 
         WHERE CategoryContentId LIKE '%' + @subcategoryId + '%'`
      );
    const totalCount = totalResult.recordset[0].count;
    const totalPages = Math.ceil(totalCount / limit);

    if (result.recordset.length === 0) {
      return new NextResponse("No products found for this subcategory", {
        status: 404,
      });
    }

    return NextResponse.json({
      data: result.recordset,
      pagination: { currentPage: page, totalPages },
    });
  } catch (error) {
    console.error("Error fetching products by subcategory: ", error);
    return new NextResponse("Failed to fetch products by subcategory", {
      status: 500,
    });
  }
}
