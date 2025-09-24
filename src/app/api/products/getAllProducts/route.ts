export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    // Count total products
    const totalCount = await prisma.product.count();

    if (totalCount === 0) {
      return new NextResponse("No products found", { status: 404 });
    }

    // Calculate correct pagination values
    const totalPages = Math.ceil(totalCount / limit);
    const currentPageToUse = page > totalPages ? 1 : page; // Reset to page 1 if current page exceeds total pages

    // STEP 1: Get all categories in ascending order by ID
    const allCategories = await prisma.category.findMany({
      orderBy: {
        CategoryID: "asc",
      },
    });

    // STEP 2: Get all subcategories in ascending order by ID
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

    // STEP 3: Get ALL products (no pagination yet)
    const products = await prisma.product.findMany({
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
      return new NextResponse("No products found", { status: 404 });
    }

    // STEP 4: Create structured data organized by category, subcategory, and product
    const structuredData: any = {};
    let allProcessedProducts: any[] = [];

    // Process all products and organize by category and subcategory
    for (const category of allCategories) {
      structuredData[category.CategoryID] = {
        category: category,
        subcategories: {},
        products: [],
      };
    }

    // Assign products to their categories/subcategories
    for (const product of products) {
      const categoryId = product.Category?.CategoryID;
      const subcategoryIds = parseCategoryContentIds(product);

      if (!categoryId || !structuredData[categoryId]) continue;

      // Add product to its category's product list
      structuredData[categoryId].products.push(product);

      // Add product to each of its subcategories
      for (const subcatId of subcategoryIds) {
        const subcat = subcategoryMap.get(subcatId);
        if (!subcat) continue;

        if (!structuredData[categoryId].subcategories[subcatId]) {
          structuredData[categoryId].subcategories[subcatId] = {
            subcategory: subcat,
            products: [],
          };
        }

        structuredData[categoryId].subcategories[subcatId].products.push(product);
      }
    }

    // STEP 5: Flatten the structured data into a list, preserving order
    for (const categoryId of Object.keys(structuredData).sort((a, b) => Number(a) - Number(b))) {
      const categoryData = structuredData[categoryId];

      // Skip empty categories
      if (categoryData.products.length === 0) continue;

      // For each subcategory in this category, add its products to the list
      const subcategoryIds = Object.keys(categoryData.subcategories).sort(
        (a, b) => Number(a) - Number(b)
      );

      for (const subcatId of subcategoryIds) {
        const subcatData = categoryData.subcategories[subcatId];
        // Skip empty subcategories
        if (subcatData.products.length === 0) continue;

        // Sort products by ProductId descending
        const sortedProducts = subcatData.products.sort(
          (a: ProductType, b: ProductType) => b.ProductId - a.ProductId
        );

        allProcessedProducts = [...allProcessedProducts, ...sortedProducts];
      }

      // Add any products directly associated with the category (not in any subcategory)
      const productsNotInSubcats = categoryData.products.filter((p: ProductType) => {
        // Product is not in any subcategory we processed
        return !parseCategoryContentIds(p).some((id) => categoryData.subcategories[id]);
      });

      if (productsNotInSubcats.length > 0) {
        const sortedDirectProducts = productsNotInSubcats.sort(
          (a: ProductType, b: ProductType) => b.ProductId - a.ProductId
        );
        allProcessedProducts = [...allProcessedProducts, ...sortedDirectProducts];
      }
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

    // STEP 6: Apply pagination AFTER organizing
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

    // Construct the response
    const response = {
      data,
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
    console.error("Error fetching all products:", error);
    return new NextResponse("Failed to fetch products", { status: 500 });
  }
}
