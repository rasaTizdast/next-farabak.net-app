import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     tags:
 *       - Admin
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
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search query for filtering products by description keywords.
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: Filter by category ID.
 *       - in: query
 *         name: subcategory
 *         schema:
 *           type: integer
 *         description: Filter by subcategory ID.
 *       - in: query
 *         name: available
 *         schema:
 *           type: string
 *           enum: [true, false, all]
 *         description: Filter by availability status (true/false). Use 'all' to return both.
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
 *                         type: array
 *                         items:
 *                           type: string
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
 *                       categoryName:
 *                         type: string
 *                       subCategoryName:
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
  QrCode_Key: string | null;
  QrCode_expiryDays: string | null;
  Category?: {
    CategoryID: number;
    Name: string | null;
    Slug: string | null;
    Available: boolean | null;
    InsertDate: Date | null;
    ModifyDate: Date | null;
    Category_groupId: number | null;
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
 * Parse the CategoryContentId string into an array of numbers
 */
function parseCategoryContentIds(product: ProductType): number[] {
  if (!product.CategoryContentId) return [];

  return product.CategoryContentId.split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "30", 10);
  const query = searchParams.get("q") || "";
  const category = parseInt(searchParams.get("category") || "0", 10);
  const subcategory = searchParams.get("subcategory") || "";
  const available = searchParams.get("available");

  try {
    const conditions: any = {};

    // Enhanced search logic with variants
    if (query.trim()) {
      const searchQuery = query.trim();
      const searchVariants = generateSearchVariants(searchQuery);
      const orConditions: any[] = [];

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

      conditions.OR = orConditions;
    }

    if (category > 0) {
      conditions.CategoryId = category;
    }

    if (subcategory) {
      const subcategoryIds = subcategory.split(",").map((id) => id.trim());

      // Handle the OR conditions for subcategories properly
      if (!conditions.OR) {
        conditions.OR = [];
      } else if (!Array.isArray(conditions.OR)) {
        conditions.OR = [conditions.OR];
      }

      // Add subcategory conditions
      conditions.OR = [
        ...conditions.OR,
        ...subcategoryIds.map((id) => ({
          CategoryContentId: {
            contains: id,
            mode: "insensitive",
          },
        })),
      ];
    }

    if (available && available !== "all") {
      conditions.Available = available === "true";
    }

    // First, get the total count of products matching the conditions
    const totalCount = await prisma.product.count({
      where: conditions,
    });

    // If there are no products at all matching the conditions
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
    const totalPages = Math.ceil(totalCount / limit);
    const currentPageToUse = page > totalPages ? 1 : page;

    // STEP 1: Get all categories and subcategories
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

    // Create maps for efficient lookups
    const subcategoryMap = new Map();
    allSubCategories.forEach((sub) => {
      subcategoryMap.set(sub.CategoryContentId, sub);
    });

    // STEP 2: Get ALL products matching the conditions (without pagination)
    const allProducts = await prisma.product.findMany({
      where: conditions,
      include: {
        Category: true,
      },
      orderBy: {
        ProductId: "desc",
      },
    });

    // STEP 3: Create structured data organized by category, subcategory, and product
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
    for (const product of allProducts) {
      const categoryId = product.CategoryId;
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

    // STEP 4: Flatten the structured data into a list, preserving order
    for (const categoryId of Object.keys(structuredData).sort((a, b) => Number(a) - Number(b))) {
      const categoryData = structuredData[categoryId];

      // For each subcategory in this category, add its products to the list
      const subcategoryIds = Object.keys(categoryData.subcategories).sort(
        (a, b) => Number(a) - Number(b)
      );

      for (const subcatId of subcategoryIds) {
        const subcatData = categoryData.subcategories[subcatId];
        // Sort products by ProductId descending
        const sortedProducts = subcatData.products.sort(
          (a: ProductType, b: ProductType) => b.ProductId - a.ProductId
        );

        allProcessedProducts = [...allProcessedProducts, ...sortedProducts];
      }

      // Add any products directly associated with the category (not in any subcategory)
      const productsNotInSubcats = categoryData.products.filter((p: ProductType) => {
        return !parseCategoryContentIds(p).some((id) => categoryData.subcategories[id]);
      });

      if (productsNotInSubcats.length > 0) {
        const sortedDirectProducts = productsNotInSubcats.sort(
          (a: ProductType, b: ProductType) => b.ProductId - a.ProductId
        );
        allProcessedProducts = [...allProcessedProducts, ...sortedDirectProducts];
      }
    }

    // Remove duplicate products
    const processedProductIds = new Set();
    allProcessedProducts = allProcessedProducts.filter((p) => {
      if (processedProductIds.has(p.ProductId)) {
        return false;
      }
      processedProductIds.add(p.ProductId);
      return true;
    });

    // STEP 5: If search query exists, calculate and sort by relevance with enhanced matching
    let finalSortedProducts;

    if (query.trim()) {
      // Add relevance score with enhanced matching
      const scoredProducts = allProcessedProducts.map((product) => ({
        product,
        score: calculateRelevanceScore(product, query.trim()),
      }));

      scoredProducts.sort((a, b) => b.score - a.score);
      finalSortedProducts = scoredProducts;
    } else {
      // If no search query, use the category/subcategory order we already established
      finalSortedProducts = allProcessedProducts.map((product) => ({
        product,
        score: 0,
      }));
    }

    // STEP 6: Apply pagination to the ALREADY ORGANIZED list
    const startIndex = (currentPageToUse - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = finalSortedProducts.slice(startIndex, endIndex);

    // STEP 7: Format the data for the response
    const data = paginatedProducts.map(({ product, score }) => {
      const categorySlug = product.Category?.Slug || null;

      // Parse CategoryContentId string
      const categoryContentIds = parseCategoryContentIds(product);

      // Map subcategories from the pre-fetched map
      const subcategories = categoryContentIds
        .map((id) => subcategoryMap.get(id))
        .filter((sub) => sub !== undefined);

      // Extract subCategory slugs and names
      const subCategoryName =
        subcategories.length > 0 ? subcategories.map((sub) => sub.Name).join(", ") : null;

      const categoryContentDetails = subcategories.map((sub) => ({
        CategoryContentId: sub.CategoryContentId,
        Name: sub.Name || "",
      }));

      const { ProductId, Name, Type, Description, Price, Available, Slug, ...rest } = product;

      // Include relevance score in the output for debugging
      return {
        ProductId,
        Name,
        Type: Type || "",
        Description,
        categoryName: product.Category?.Name || "",
        subCategoryName,
        productSlug: Slug || "",
        Price: parseFloat(Price || "0"),
        Available: Available || false,
        link: `${categorySlug}/${subcategories[0]?.Slug || ""}/${Slug}`,
        CategoryContentIds: categoryContentDetails,
        _relevanceScore: score, // For debugging
        ...rest, // Include remaining untouched fields
      };
    });

    return NextResponse.json({
      data,
      pagination: {
        totalCount,
        currentPage: currentPageToUse,
        totalPages,
        hasNextPage: currentPageToUse < totalPages,
        hasPrevPage: currentPageToUse > 1,
      },
      searchInfo: query.trim()
        ? {
            query: query.trim(),
            resultsWithScores: data
              .map((p) => ({
                id: p.ProductId,
                name: p.Type,
                score: p._relevanceScore,
              }))
              .slice(0, 5),
          }
        : null,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return new NextResponse("دریافت محصولات با شکست مواجه شد!", {
      status: 500,
    });
  }
}
