import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming you have a Prisma instance set up

/**
 * @swagger
 * /api/products/getProductsByCategory/{categoryName}:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get products by category name with pagination
 *     description: Returns a paginated list of products filtered by category name with category and subcategory slugs included in the product links.
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
 *         description: A paginated list of filtered products with links
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
 *                       productSlug:
 *                         type: string
 *                       categorySlug:
 *                         type: string
 *                       subCategorySlug:
 *                         type: string
 *                       link:
 *                         type: string
 *                         description: The full URL to the product.
 *                       SEO_Title:
 *                         type: string
 *                         nullable: true
 *                       SEO_Description:
 *                         type: string
 *                         nullable: true
 *                       SEO_Keywords:
 *                         type: string
 *                         nullable: true
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
 *         description: No products found for this category
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

    // Fetch category and SEO data for the category using Prisma
    const category = await prisma.category.findFirst({
      where: { Slug: categoryName },
      include: {
        SEO_Category: true, // Include the SEO information for the category
      },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    // Count total products in the category
    const totalCount = await prisma.product.count({
      where: { CategoryId: category.CategoryID },
    });

    const totalPages = Math.ceil(totalCount / limit);

    // Fetch paginated products
    const products = await prisma.product.findMany({
      where: { CategoryId: category.CategoryID },
      skip: offset,
      take: limit,
      include: {
        Category: true,
      },
    });

    if (products.length === 0) {
      return new NextResponse("No products found for this category", {
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

    // Prepare the SEO details for the category
    const seoDetails = category.SEO_Category
      ? {
          SEO_Title: category.SEO_Category.SEO_Title,
          SEO_Description: category.SEO_Category.SEO_Description,
          SEO_Keywords: category.SEO_Category.SEO_Keywords,
        }
      : null;

    const response = {
      data,
      seoDetails, // Add SEO details to the response
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
    console.error(error); // Log the error for debugging
    return new NextResponse("Failed to fetch products by category", {
      status: 500,
    });
  }
}
