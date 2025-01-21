import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
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
    // Build dynamic Prisma query with category and subcategory slugs
    const products = await prisma.product.findMany({
      where: {
        OR: keywords.map((keyword) => ({
          Description: {
            contains: keyword,
            mode: "insensitive",
          },
        })),
      },
      include: {
        Category: {
          select: {
            Slug: true,
          },
        },
      },
      skip: offset,
      take: limit > 0 ? limit : undefined,
    });

    if (products.length === 0) {
      return new NextResponse("No matching products found", { status: 404 });
    }

    // Fetch total count for pagination, if limit is applied
    let totalCount = null;
    let totalPages = null;

    if (limit > 0) {
      totalCount = await prisma.product.count({
        where: {
          OR: keywords.map((keyword) => ({
            Description: {
              contains: keyword,
              mode: "insensitive",
            },
          })),
        },
      });
      totalPages = Math.ceil(totalCount / limit);
    }

    // Add link for each product, including categorySlug and subCategorySlug
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

    return NextResponse.json({
      data,
      pagination: {
        totalCount: totalCount || products.length, // Use products length if totalCount is null
        currentPage: page,
        totalPages: totalPages || 1, // Default to 1 page
        hasNextPage:
          limit > 0 && totalPages !== null ? page < totalPages : false, // False if no limit
        hasPrevPage: limit > 0 && page > 1, // True only if limit > 0 and currentPage > 1
      },
    });
  } catch (error) {
    return new NextResponse("Failed to search products", { status: 500 });
  }
}
