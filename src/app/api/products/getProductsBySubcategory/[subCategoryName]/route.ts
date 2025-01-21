import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

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
    // Get the subcategory ID based on the provided subCategoryName
    const subCategory = await prisma.categoryContent.findFirst({
      where: { Slug: subCategoryName },
    });

    if (!subCategory) {
      return new NextResponse("Subcategory not found", { status: 404 });
    }

    const subCategoryId = subCategory.CategoryContentId.toString();

    // Count total products for pagination
    const totalCount = await prisma.product.count({
      where: {
        CategoryContentId: {
          contains: subCategoryId,
        },
      },
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Fetch paginated products with category and subcategory slugs
    const products = await prisma.product.findMany({
      where: {
        CategoryContentId: {
          contains: subCategoryId,
        },
      },
      include: {
        Category: true,
      },
      skip: offset,
      take: limit,
      orderBy: {
        ProductId: "asc",
      },
    });

    if (products.length === 0) {
      return new NextResponse("No products found for this subcategory", {
        status: 404,
      });
    }

    // Add link for each product
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
    return new NextResponse("Failed to fetch products by subcategory", {
      status: 500,
    });
  }
}
