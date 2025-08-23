import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

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

// Helper function to calculate search relevance score
function calculateRelevanceScore(product: ProductType, query: string): number {
  const normalizedQuery = query.toLowerCase().trim();
  let score = 0;

  // Type contains product name - highest priority (exact match)
  if (product.Type?.toLowerCase() === normalizedQuery) {
    score += 100;
  }
  // Type contains the query as a substring (product name partial match)
  else if (product.Type?.toLowerCase().includes(normalizedQuery)) {
    score += 70;
  }
  // Begin with query (higher priority)
  else if (product.Type?.toLowerCase().startsWith(normalizedQuery)) {
    score += 80;
  }

  // Name contains brief description - high priority
  if (product.Name?.toLowerCase().includes(normalizedQuery)) {
    score += 50;
  }

  // Description contains keywords - medium priority
  if (product.Description?.toLowerCase().includes(normalizedQuery)) {
    score += 30;
  }

  // Slug match - lower priority than direct name match
  if (product.Slug?.toLowerCase().includes(normalizedQuery)) {
    score += 25;
  }

  // Add match on other fields like SEO_Title, etc.
  if (product.SEO_Title?.toLowerCase().includes(normalizedQuery)) {
    score += 10;
  }

  return score;
}

/**
 * Parse the CategoryContentId string into an array of numbers
 */
function parseCategoryContentIds(product: ProductType): number[] {
  if (!product.CategoryContentId) return [];

  return product.CategoryContentId.split(",")
    .map((id: string) => parseInt(id.trim(), 10))
    .filter((id: number) => !isNaN(id));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limitParam = searchParams.get("limit");
  const limit = limitParam !== null ? parseInt(limitParam, 10) : 0; // Default to 0 for no limit

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "Invalid search query" }, { status: 400 });
  }

  try {
    const searchQuery = query.trim();

    // Build enhanced search conditions - search across multiple fields
    const searchCondition: Prisma.ProductWhereInput = {
      Available: true, // Only search for available products
      OR: [
        // Product name (stored in Type field) - contains search
        {
          Type: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        // Brief description (stored in Name field)
        {
          Name: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        // Keywords (stored in Description field)
        {
          Description: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        // Search by slug as well
        {
          Slug: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
        // Also search in SEO fields
        {
          SEO_Title: {
            contains: searchQuery,
            mode: "insensitive",
          },
        },
      ],
    };

    // First, get the total count of products matching the conditions
    const totalCount = await prisma.product.count({
      where: searchCondition,
    });

    if (totalCount === 0) {
      return NextResponse.json(
        {
          data: [],
          pagination: {
            totalCount: 0,
            currentPage: 1,
            totalPages: 0,
            hasNextPage: false,
            hasPrevPage: false,
          },
          message: "محصولی یافت نشد!",
        },
        { status: 200 }
      );
    }

    // Calculate correct pagination values
    const totalPages = Math.ceil(totalCount / (limit > 0 ? limit : totalCount));
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

    // STEP 3: Get ALL products matching search conditions (no pagination yet)
    const products = await prisma.product.findMany({
      where: searchCondition,
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
          (a: any, b: any) => b.ProductId - a.ProductId
        );

        allProcessedProducts = [...allProcessedProducts, ...sortedProducts];
      }

      // Add any products directly associated with the category (not in any subcategory)
      const productsNotInSubcats = categoryData.products.filter((p: any) => {
        // Product is not in any subcategory we processed
        return !parseCategoryContentIds(p).some((id) => categoryData.subcategories[id]);
      });

      if (productsNotInSubcats.length > 0) {
        const sortedDirectProducts = productsNotInSubcats.sort(
          (a: any, b: any) => b.ProductId - a.ProductId
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

    // Calculate relevance scores and reorder by relevance (search-specific)
    const scoredProducts = allProcessedProducts.map((product) => ({
      product,
      score: calculateRelevanceScore(product, searchQuery),
    }));

    // Sort by relevance score
    scoredProducts.sort((a, b) => b.score - a.score);

    // STEP 6: Apply pagination AFTER organizing and scoring
    const startIndex = (currentPageToUse - 1) * (limit > 0 ? limit : totalCount);
    const endIndex = Math.min(startIndex + (limit > 0 ? limit : totalCount), scoredProducts.length);
    const paginatedProducts = scoredProducts.slice(startIndex, endIndex);

    // Process the products to include links and subcategory information
    const data = await Promise.all(
      paginatedProducts.map(async ({ product, score }) => {
        const categorySlug = product.Category?.Slug || null;

        // Parse CategoryContentId string
        const categoryContentIds = parseCategoryContentIds(product);

        // Get subcategories from the pre-fetched map
        const subcategories = categoryContentIds
          .map((id: number) => subcategoryMap.get(id))
          .filter((sub: any) => sub !== undefined);

        // Use the first subcategory for the link
        const firstSubCategory = subcategories.length > 0 ? subcategories[0] : null;

        return {
          ...product,
          productSlug: product.Slug,
          categorySlug,
          subCategorySlug: firstSubCategory?.Slug || null,
          link: `${categorySlug}/${firstSubCategory?.Slug || ""}/${product.Slug}`,
          _relevanceScore: score, // For debugging
        };
      })
    );

    return NextResponse.json({
      data,
      pagination: {
        totalCount,
        currentPage: currentPageToUse,
        totalPages,
        hasNextPage: currentPageToUse < totalPages,
        hasPrevPage: currentPageToUse > 1,
      },
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return new NextResponse("دریافت محصولات با شکست مواجه شد!", {
      status: 500,
    });
  }
}
