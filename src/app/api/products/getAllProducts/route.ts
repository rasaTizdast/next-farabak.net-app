export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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

    // Count total products
    const totalCount = await prisma.product.count();
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch products with category and subcategory slugs
    const products = await prisma.product.findMany({
      skip: offset,
      take: limit,
      include: {
        Category: true, // Include related category
      },
    });

    if (products.length === 0) {
      return new NextResponse("No products found", { status: 404 });
    }

    // Map the products to include category and subcategory slugs
    const data = await Promise.all(
      products.map(async (product) => {
        const categorySlug = product.Category?.Slug || null;

        // Parse CategoryContentId string
        const categoryContentIds = product.CategoryContentId
          ? product.CategoryContentId.split(",").map((id) =>
              parseInt(id.trim(), 10)
            )
          : [];

        // Fetch first matching subcategory
        const subCategory = await prisma.categoryContent.findFirst({
          where: {
            CategoryContentId: { in: categoryContentIds },
          },
        });

        return {
          ...product,
          productSlug: product.Slug,
          categorySlug,
          subCategorySlug: subCategory?.Slug || null,
          link: `${categorySlug}/${subCategory?.Slug || ""}/${product.Slug}`,
        };
      })
    );

    // Construct the response
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
