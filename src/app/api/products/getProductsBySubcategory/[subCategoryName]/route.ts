import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

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

// Helper type definition
type ProductType = {
  ProductId: number;
  Name: string | null;
  Type: string | null;
  Price: string | null;
  Discount: string | null;
  CategoryContentId: string | null;
  img1: string | null;
  img2: string | null;
  Available: boolean | null;
  Description: string | null;
  CategoryId: number | null;
  Slug: string | null;
  SEO_Title: string | null;
  SEO_Description: string | null;
  Category?: {
    Slug: string | null;
    Name: string | null;
    CategoryID: number;
  } | null;
};

/**
 * Parse the CategoryContentId string into an array of numbers
 */
function parseCategoryContentIds(product: ProductType): number[] {
  if (!product.CategoryContentId) return [];

  return product.CategoryContentId.split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id));
}

export async function GET(req: Request, props: { params: Promise<{ subCategoryName: string }> }) {
  const params = await props.params;
  const { searchParams } = new URL(req.url);
  const subCategoryName = params.subCategoryName;

  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "30", 10);

  try {
    // Get the subcategory ID based on the provided subCategoryName
    const subCategory = await prisma.categoryContent.findFirst({
      where: { Slug: subCategoryName },
      include: {
        SEO_CategoryContent: true, // Include the SEO information for the category
      },
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

    if (totalCount === 0) {
      return new NextResponse("No products found for this subcategory", {
        status: 404,
      });
    }

    // Calculate correct pagination values
    const totalPages = Math.ceil(totalCount / limit);
    const currentPageToUse = page > totalPages ? 1 : page; // Reset to page 1 if current page exceeds total pages

    // Get all subcategories in ascending order by ID
    const allSubCategories = await prisma.categoryContent.findMany({
      orderBy: {
        CategoryContentId: "asc",
      },
    });

    // Create maps for efficient lookups
    const subcategoryMap = new Map();
    allSubCategories.forEach((sub) => {
      subcategoryMap.set(sub.CategoryContentId, sub);
    });

    // Get ALL products for this subcategory (no pagination yet)
    const products = await prisma.product.findMany({
      where: {
        CategoryContentId: {
          contains: subCategoryId,
        },
      },
      include: {
        Category: {
          select: {
            Slug: true,
            Name: true,
            CategoryID: true,
          },
        },
      },
      orderBy: {
        ProductId: "desc", // Default ordering is newest first
      },
    });

    if (products.length === 0) {
      return new NextResponse("No products found for this subcategory", {
        status: 404,
      });
    }

    // Group products by category for better organization
    const productsByCategory: Record<number, ProductType[]> = {};

    for (const product of products) {
      const categoryId = product.Category?.CategoryID;
      if (!categoryId) continue;

      if (!productsByCategory[categoryId]) {
        productsByCategory[categoryId] = [];
      }

      productsByCategory[categoryId].push(product);
    }

    // Sort all products by ProductId (newest first) within each category
    let allProcessedProducts: ProductType[] = [];

    // Process categories in ascending order by ID
    const categoryIds = Object.keys(productsByCategory).sort((a, b) => Number(a) - Number(b));

    for (const categoryId of categoryIds) {
      const productsInCategory = productsByCategory[categoryId];

      // Sort products by ProductId descending (newest first)
      const sortedProducts = productsInCategory.sort(
        (a: ProductType, b: ProductType) => b.ProductId - a.ProductId
      );

      allProcessedProducts = [...allProcessedProducts, ...sortedProducts];
    }

    // Apply pagination AFTER organizing
    const startIndex = (currentPageToUse - 1) * limit;
    const endIndex = Math.min(startIndex + limit, allProcessedProducts.length);
    const paginatedProducts = allProcessedProducts.slice(startIndex, endIndex);

    // Process the products to include links and subcategory information
    const data = paginatedProducts.map((product) => {
      const categorySlug = product.Category?.Slug || null;

      // Parse CategoryContentId string
      const categoryContentIds = parseCategoryContentIds(product);

      // Get subcategories from the pre-fetched map
      const subcategories = categoryContentIds
        .map((id) => subcategoryMap.get(id))
        .filter((sub) => sub !== undefined);

      // Use the first subcategory for the link
      const firstSubCategory = subcategories.length > 0 ? subcategories[0] : null;

      return {
        ...product,
        productSlug: product.Slug,
        categorySlug,
        subCategorySlug: firstSubCategory?.Slug || null,
        link: `${categorySlug}/${firstSubCategory?.Slug || ""}/${product.Slug}`,
      };
    });

    // Prepare the SEO details for the category
    const seoDetails = subCategory.SEO_CategoryContent
      ? {
          SEO_Title: subCategory.SEO_CategoryContent.SEO_Title,
          SEO_Description: subCategory.SEO_CategoryContent.SEO_Description,
          SEO_Keywords: subCategory.SEO_CategoryContent.SEO_Keywords,
        }
      : null;

    const response = {
      data,
      seoDetails,
      pagination: {
        totalCount,
        currentPage: currentPageToUse,
        totalPages,
        hasNextPage: currentPageToUse < totalPages,
        hasPrevPage: currentPageToUse > 1,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching products by subcategory:", error);
    return new NextResponse("Failed to fetch products by subcategory", {
      status: 500,
    });
  }
}
