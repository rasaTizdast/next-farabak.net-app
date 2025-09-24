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

export async function GET(req: Request, props: { params: Promise<{ categoryName: string }> }) {
  const params = await props.params;
  const categoryName = params.categoryName;

  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

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

    if (totalCount === 0) {
      return new NextResponse("No products found for this category", {
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

    // Get ALL products for this category (no pagination yet)
    const products = await prisma.product.findMany({
      where: { CategoryId: category.CategoryID },
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
        ProductId: "desc", // Default ordering within subcategories
      },
    });

    if (products.length === 0) {
      return new NextResponse("No products found for this category", {
        status: 404,
      });
    }

    // Create structured data organized by subcategory and product
    const structuredData: {
      category: typeof category;
      subcategories: { [key: string]: { subcategory: any; products: ProductType[] } };
      products: ProductType[];
    } = {
      category: category,
      subcategories: {},
      products: [],
    };
    let allProcessedProducts: ProductType[] = [];

    // Assign products to their subcategories
    for (const product of products) {
      const subcategoryIds = parseCategoryContentIds(product);

      // Add product to its category's product list
      structuredData.products.push(product);

      // Add product to each of its subcategories
      for (const subcatId of subcategoryIds) {
        const subcat = subcategoryMap.get(subcatId);
        if (!subcat) continue;

        if (!structuredData.subcategories[subcatId]) {
          structuredData.subcategories[subcatId] = {
            subcategory: subcat,
            products: [],
          };
        }

        structuredData.subcategories[subcatId].products.push(product);
      }
    }

    // Flatten the structured data into a list, preserving subcategory order
    const subcategoryIds = Object.keys(structuredData.subcategories).sort(
      (a, b) => Number(a) - Number(b)
    );

    for (const subcatId of subcategoryIds) {
      const subcatData = structuredData.subcategories[subcatId];
      // Skip empty subcategories
      if (subcatData.products.length === 0) continue;

      // Sort products by ProductId descending
      const sortedProducts = subcatData.products.sort(
        (a: ProductType, b: ProductType) => b.ProductId - a.ProductId
      );

      allProcessedProducts = [...allProcessedProducts, ...sortedProducts];
    }

    // Add any products directly associated with the category (not in any subcategory)
    const productsNotInSubcats = structuredData.products.filter((p: ProductType) => {
      // Product is not in any subcategory we processed
      return !parseCategoryContentIds(p).some((id) => structuredData.subcategories[id]);
    });

    if (productsNotInSubcats.length > 0) {
      const sortedDirectProducts = productsNotInSubcats.sort(
        (a: ProductType, b: ProductType) => b.ProductId - a.ProductId
      );
      allProcessedProducts = [...allProcessedProducts, ...sortedDirectProducts];
    }

    // Remove duplicate products - sometimes products can be in multiple subcategories
    const processedProductIds = new Set();
    allProcessedProducts = allProcessedProducts.filter((p) => {
      if (processedProductIds.has(p.ProductId)) {
        return false;
      }
      processedProductIds.add(p.ProductId);
      return true;
    });

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
        currentPage: currentPageToUse,
        totalPages,
        hasNextPage: currentPageToUse < totalPages,
        hasPrevPage: currentPageToUse > 1,
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
