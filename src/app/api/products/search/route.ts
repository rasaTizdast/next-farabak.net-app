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

/**
 * Normalize text for better matching:
 * - Convert to lowercase
 * - Remove extra spaces
 * - Remove special characters (keep alphanumeric and spaces)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "") // Remove special chars
    .replace(/\s+/g, " ") // Normalize spaces
    .trim();
}

/**
 * Create search variants to handle spacing issues
 * "ultra studio" -> ["ultrastudio", "ultra studio", "ultra-studio"]
 */
function generateSearchVariants(query: string): string[] {
  const normalized = normalizeText(query);
  const variants = new Set<string>();

  // Add original normalized
  variants.add(normalized);

  // Add version without spaces
  variants.add(normalized.replace(/\s+/g, ""));

  // Add version with hyphens
  variants.add(normalized.replace(/\s+/g, "-"));

  // Split into tokens for individual word matching
  const tokens = normalized.split(/\s+/).filter((t) => t.length > 0);
  tokens.forEach((token) => variants.add(token));

  return Array.from(variants).filter((v) => v.length > 0);
}

/**
 * Enhanced relevance scoring with fuzzy matching
 */
function calculateRelevanceScore(product: ProductType, query: string): number {
  const searchVariants = generateSearchVariants(query);
  const normalizedQuery = normalizeText(query);
  let score = 0;

  // Normalize product fields
  const normalizedType = normalizeText(product.Type || "");
  const normalizedName = normalizeText(product.Name || "");
  const normalizedDesc = normalizeText(product.Description || "");
  const normalizedSlug = normalizeText(product.Slug || "");
  const normalizedSeoTitle = normalizeText(product.SEO_Title || "");

  // Check each search variant against product fields
  for (const variant of searchVariants) {
    // Type (product name) - highest priority
    if (normalizedType === variant) {
      score += 100;
    } else if (normalizedType.includes(variant)) {
      score += 70;
    } else if (normalizedType.startsWith(variant)) {
      score += 80;
    }

    // Name (brief description)
    if (normalizedName.includes(variant)) {
      score += 50;
    }

    // Description
    if (normalizedDesc.includes(variant)) {
      score += 30;
    }

    // Slug
    if (normalizedSlug.includes(variant)) {
      score += 25;
    }

    // SEO Title
    if (normalizedSeoTitle.includes(variant)) {
      score += 10;
    }
  }

  // Bonus: Check if ALL tokens from the query appear in the product
  const queryTokens = normalizedQuery.split(/\s+/).filter((t) => t.length > 1);
  const allTokensMatch = queryTokens.every(
    (token) =>
      normalizedType.includes(token) ||
      normalizedName.includes(token) ||
      normalizedDesc.includes(token)
  );

  if (allTokensMatch && queryTokens.length > 1) {
    score += 40; // Bonus for matching all words
  }

  return score;
}

/**
 * Build flexible search conditions using OR combinations
 */
function buildSearchConditions(query: string): Prisma.ProductWhereInput {
  const searchVariants = generateSearchVariants(query);
  const orConditions: Prisma.ProductWhereInput[] = [];

  // For each variant, search across all fields
  for (const variant of searchVariants) {
    orConditions.push(
      {
        Type: {
          contains: variant,
          mode: "insensitive",
        },
      },
      {
        Name: {
          contains: variant,
          mode: "insensitive",
        },
      },
      {
        Description: {
          contains: variant,
          mode: "insensitive",
        },
      },
      {
        Slug: {
          contains: variant,
          mode: "insensitive",
        },
      },
      {
        SEO_Title: {
          contains: variant,
          mode: "insensitive",
        },
      }
    );
  }

  return {
    Available: true,
    OR: orConditions,
  };
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
  const limit = limitParam !== null ? parseInt(limitParam, 10) : 0;

  if (!query || query.trim().length === 0) {
    return NextResponse.json({ error: "Invalid search query" }, { status: 400 });
  }

  try {
    const searchQuery = query.trim();

    // Build enhanced search conditions with variant matching
    const searchCondition = buildSearchConditions(searchQuery);

    // Get total count
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

    // Calculate pagination
    const totalPages = Math.ceil(totalCount / (limit > 0 ? limit : totalCount));
    const currentPageToUse = page > totalPages ? 1 : page;

    // Get categories and subcategories
    const allCategories = await prisma.category.findMany({
      orderBy: {
        CategoryID: "asc",
      },
    });

    const allSubCategories = await prisma.categoryContent.findMany({
      orderBy: {
        CategoryContentId: "asc",
      },
    });

    const subcategoryMap = new Map();
    allSubCategories.forEach((sub) => {
      subcategoryMap.set(sub.CategoryContentId, sub);
    });

    // Get all matching products
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
        ProductId: "desc",
      },
    });

    // Organize by category and subcategory
    const structuredData: any = {};
    let allProcessedProducts: any[] = [];

    for (const category of allCategories) {
      structuredData[category.CategoryID] = {
        category: category,
        subcategories: {},
        products: [],
      };
    }

    for (const product of products) {
      const categoryId = product.Category?.CategoryID;
      const subcategoryIds = parseCategoryContentIds(product);

      if (!categoryId || !structuredData[categoryId]) continue;

      structuredData[categoryId].products.push(product);

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

    // Flatten structured data
    for (const categoryId of Object.keys(structuredData).sort((a, b) => Number(a) - Number(b))) {
      const categoryData = structuredData[categoryId];

      if (categoryData.products.length === 0) continue;

      const subcategoryIds = Object.keys(categoryData.subcategories).sort(
        (a, b) => Number(a) - Number(b)
      );

      for (const subcatId of subcategoryIds) {
        const subcatData = categoryData.subcategories[subcatId];
        if (subcatData.products.length === 0) continue;

        const sortedProducts = subcatData.products.sort(
          (a: any, b: any) => b.ProductId - a.ProductId
        );

        allProcessedProducts = [...allProcessedProducts, ...sortedProducts];
      }

      const productsNotInSubcats = categoryData.products.filter((p: any) => {
        return !parseCategoryContentIds(p).some((id) => categoryData.subcategories[id]);
      });

      if (productsNotInSubcats.length > 0) {
        const sortedDirectProducts = productsNotInSubcats.sort(
          (a: any, b: any) => b.ProductId - a.ProductId
        );
        allProcessedProducts = [...allProcessedProducts, ...sortedDirectProducts];
      }
    }

    // Remove duplicates
    const processedProductIds = new Set();
    allProcessedProducts = allProcessedProducts.filter((p) => {
      if (processedProductIds.has(p.ProductId)) {
        return false;
      }
      processedProductIds.add(p.ProductId);
      return true;
    });

    // Calculate relevance scores with enhanced matching
    const scoredProducts = allProcessedProducts.map((product) => ({
      product,
      score: calculateRelevanceScore(product, searchQuery),
    }));

    // Sort by relevance
    scoredProducts.sort((a, b) => b.score - a.score);

    // Apply pagination
    const startIndex = (currentPageToUse - 1) * (limit > 0 ? limit : totalCount);
    const endIndex = Math.min(startIndex + (limit > 0 ? limit : totalCount), scoredProducts.length);
    const paginatedProducts = scoredProducts.slice(startIndex, endIndex);

    // Process products for response
    const data = await Promise.all(
      paginatedProducts.map(async ({ product, score }) => {
        const categorySlug = product.Category?.Slug || null;
        const categoryContentIds = parseCategoryContentIds(product);

        const subcategories = categoryContentIds
          .map((id: number) => subcategoryMap.get(id))
          .filter((sub: any) => sub !== undefined);

        const firstSubCategory = subcategories.length > 0 ? subcategories[0] : null;

        return {
          ...product,
          productSlug: product.Slug,
          categorySlug,
          subCategorySlug: firstSubCategory?.Slug || null,
          link: `${categorySlug}/${firstSubCategory?.Slug || ""}/${product.Slug}`,
          _relevanceScore: score,
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
