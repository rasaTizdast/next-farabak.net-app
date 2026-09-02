import { Prisma, type CategoryContent } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { cachedQuery } from "./cache";
import { TAGS } from "./tags";

// ---------------------------------------------------------------------------
// Shared types & helpers (verbatim query/map tokens from the route handlers)
// ---------------------------------------------------------------------------

export interface ProductsQueryParams {
  page: number;
  limit: number;
}

export interface PaginationInfo {
  totalCount: number;
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ProductSeoDetails {
  SEO_Title: string | null;
  SEO_Description: string | null;
  SEO_Keywords: string | null;
}

const CATEGORY_PRODUCT_INCLUDE = {
  Category: {
    select: {
      Slug: true,
      Name: true,
      CategoryID: true,
    },
  },
} as const;

type ProductWithCategory = Prisma.ProductGetPayload<{ include: typeof CATEGORY_PRODUCT_INCLUDE }>;

export type CategoryFeedItem = ProductWithCategory & {
  productSlug: string | null;
  categorySlug: string | null;
  subCategorySlug: string | null;
  link: string;
};

export type SearchFeedItem = CategoryFeedItem & {
  _relevanceScore: number;
};

export type SubcategoryFeedMap = Map<number, CategoryContent>;

function parseCategoryContentIds(product: { CategoryContentId: string | null }): number[] {
  if (!product.CategoryContentId) return [];

  return product.CategoryContentId.split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id));
}

function buildSubcategoryMap(subcategories: CategoryContent[]): SubcategoryFeedMap {
  const subcategoryMap = new Map<number, CategoryContent>();
  subcategories.forEach((sub) => {
    subcategoryMap.set(sub.CategoryContentId, sub);
  });
  return subcategoryMap;
}

function enrichFeedItem(
  product: ProductWithCategory,
  subcategoryMap: SubcategoryFeedMap,
  preferredSubcategorySlug?: string | null
): CategoryFeedItem {
  const categorySlug = product.Category?.Slug || null;

  const subcategories = parseCategoryContentIds(product)
    .map((id) => subcategoryMap.get(id))
    .filter((sub): sub is CategoryContent => sub !== undefined);

  const firstSubcategory = subcategories.length > 0 ? subcategories[0] : null;
  const subCategorySlug = preferredSubcategorySlug || firstSubcategory?.Slug || null;

  return {
    ...product,
    productSlug: product.Slug,
    categorySlug,
    subCategorySlug,
    link: `${categorySlug}/${subCategorySlug || ""}/${product.Slug}`,
  };
}

interface PaginatedProductResult {
  data: CategoryFeedItem[];
  pagination: PaginationInfo;
}

// ---------------------------------------------------------------------------
// /api/products/getAllProducts
// ---------------------------------------------------------------------------

async function queryAllProducts(
  params: ProductsQueryParams
): Promise<PaginatedProductResult | null> {
  const { page, limit } = params;

  const totalCount = await prisma.product.count();

  if (totalCount === 0) {
    return null;
  }

  const totalPages = Math.ceil(totalCount / limit);
  const currentPageToUse = page > totalPages ? 1 : page;

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

  const subcategoryMap = buildSubcategoryMap(allSubCategories);

  const products = await prisma.product.findMany({
    include: CATEGORY_PRODUCT_INCLUDE,
    orderBy: {
      ProductId: "desc",
    },
  });

  if (products.length === 0) {
    return null;
  }

  const structuredData = new Map<
    number,
    {
      products: ProductWithCategory[];
      subcategories: Map<number, ProductWithCategory[]>;
    }
  >();

  for (const category of allCategories) {
    structuredData.set(category.CategoryID, { products: [], subcategories: new Map() });
  }

  for (const product of products) {
    const categoryId = product.Category?.CategoryID;
    const categoryData = categoryId ? structuredData.get(categoryId) : undefined;

    if (!categoryId || !categoryData) continue;

    categoryData.products.push(product);

    for (const subcatId of parseCategoryContentIds(product)) {
      const subcat = subcategoryMap.get(subcatId);
      if (!subcat) continue;

      let subcatProducts = categoryData.subcategories.get(subcatId);
      if (!subcatProducts) {
        subcatProducts = [];
        categoryData.subcategories.set(subcatId, subcatProducts);
      }
      subcatProducts.push(product);
    }
  }

  let allProcessedProducts: ProductWithCategory[] = [];

  for (const categoryId of [...structuredData.keys()].sort((a, b) => a - b)) {
    const categoryData = structuredData.get(categoryId);
    if (!categoryData || categoryData.products.length === 0) continue;

    const subcategoryIds = [...categoryData.subcategories.keys()].sort((a, b) => a - b);

    for (const subcatId of subcategoryIds) {
      const subcatProducts = categoryData.subcategories.get(subcatId);
      if (!subcatProducts || subcatProducts.length === 0) continue;

      const sortedProducts = [...subcatProducts].sort((a, b) => b.ProductId - a.ProductId);
      allProcessedProducts = [...allProcessedProducts, ...sortedProducts];
    }

    const productsNotInSubcats = categoryData.products.filter((product) => {
      return !parseCategoryContentIds(product).some((id) => categoryData.subcategories.has(id));
    });

    if (productsNotInSubcats.length > 0) {
      const sortedDirectProducts = [...productsNotInSubcats].sort(
        (a, b) => b.ProductId - a.ProductId
      );
      allProcessedProducts = [...allProcessedProducts, ...sortedDirectProducts];
    }
  }

  const processedProductIds = new Set<number>();
  allProcessedProducts = allProcessedProducts.filter((product) => {
    if (processedProductIds.has(product.ProductId)) {
      return false;
    }
    processedProductIds.add(product.ProductId);
    return true;
  });

  const startIndex = (currentPageToUse - 1) * limit;
  const endIndex = Math.min(startIndex + limit, allProcessedProducts.length);
  const paginatedProducts = allProcessedProducts.slice(startIndex, endIndex);

  const data = paginatedProducts.map((product) => enrichFeedItem(product, subcategoryMap));

  return {
    data,
    pagination: {
      totalCount,
      currentPage: currentPageToUse,
      totalPages,
      hasNextPage: currentPageToUse < totalPages,
      hasPrevPage: currentPageToUse > 1,
    },
  };
}

export const getAllProducts = cachedQuery("getAllProducts", queryAllProducts, {
  revalidate: 60,
  tags: [TAGS.products, TAGS.categories],
});

// ---------------------------------------------------------------------------
// /api/products/getProductsByCategory/:categoryName
// ---------------------------------------------------------------------------

export interface CategoryProductsResult extends PaginatedProductResult {
  seoDetails: ProductSeoDetails | null;
}

async function queryProductsByCategory(
  categoryName: string,
  params: ProductsQueryParams
): Promise<CategoryProductsResult | null> {
  const { page, limit } = params;

  const category = await prisma.category.findFirst({
    where: { Slug: categoryName },
    include: {
      SEO_Category: true,
    },
  });

  if (!category) {
    return null;
  }

  const totalCount = await prisma.product.count({
    where: { CategoryId: category.CategoryID },
  });

  if (totalCount === 0) {
    return null;
  }

  const totalPages = Math.ceil(totalCount / limit);
  const currentPageToUse = page > totalPages ? 1 : page;

  const allSubCategories = await prisma.categoryContent.findMany({
    orderBy: {
      CategoryContentId: "asc",
    },
  });

  const subcategoryMap = buildSubcategoryMap(allSubCategories);

  const products = await prisma.product.findMany({
    where: { CategoryId: category.CategoryID },
    include: CATEGORY_PRODUCT_INCLUDE,
    orderBy: {
      ProductId: "desc",
    },
  });

  if (products.length === 0) {
    return null;
  }

  const structuredData = {
    subcategories: new Map<number, ProductWithCategory[]>(),
    products: [] as ProductWithCategory[],
  };

  for (const product of products) {
    structuredData.products.push(product);

    for (const subcatId of parseCategoryContentIds(product)) {
      const subcat = subcategoryMap.get(subcatId);
      if (!subcat) continue;

      let subcatProducts = structuredData.subcategories.get(subcatId);
      if (!subcatProducts) {
        subcatProducts = [];
        structuredData.subcategories.set(subcatId, subcatProducts);
      }
      subcatProducts.push(product);
    }
  }

  let allProcessedProducts: ProductWithCategory[] = [];

  const subcategoryIds = [...structuredData.subcategories.keys()].sort((a, b) => a - b);

  for (const subcatId of subcategoryIds) {
    const subcatProducts = structuredData.subcategories.get(subcatId);
    if (!subcatProducts || subcatProducts.length === 0) continue;

    const sortedProducts = [...subcatProducts].sort((a, b) => b.ProductId - a.ProductId);
    allProcessedProducts = [...allProcessedProducts, ...sortedProducts];
  }

  const productsNotInSubcats = structuredData.products.filter((product) => {
    return !parseCategoryContentIds(product).some((id) => structuredData.subcategories.has(id));
  });

  if (productsNotInSubcats.length > 0) {
    const sortedDirectProducts = [...productsNotInSubcats].sort(
      (a, b) => b.ProductId - a.ProductId
    );
    allProcessedProducts = [...allProcessedProducts, ...sortedDirectProducts];
  }

  const processedProductIds = new Set<number>();
  allProcessedProducts = allProcessedProducts.filter((product) => {
    if (processedProductIds.has(product.ProductId)) {
      return false;
    }
    processedProductIds.add(product.ProductId);
    return true;
  });

  const startIndex = (currentPageToUse - 1) * limit;
  const endIndex = Math.min(startIndex + limit, allProcessedProducts.length);
  const paginatedProducts = allProcessedProducts.slice(startIndex, endIndex);

  const data = paginatedProducts.map((product) => enrichFeedItem(product, subcategoryMap));

  const seoDetails = category.SEO_Category
    ? {
        SEO_Title: category.SEO_Category.SEO_Title,
        SEO_Description: category.SEO_Category.SEO_Description,
        SEO_Keywords: category.SEO_Category.SEO_Keywords,
      }
    : null;

  return {
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
}

export const getProductsByCategory = cachedQuery("getProductsByCategory", queryProductsByCategory, {
  revalidate: 60,
  tags: [TAGS.products, TAGS.categories],
});

// ---------------------------------------------------------------------------
// /api/products/getProductsBySubcategory/:subCategoryName
// ---------------------------------------------------------------------------

function buildSubcategoryWhere(subCategoryId: string): Prisma.ProductWhereInput {
  return {
    OR: [
      { CategoryContentId: { equals: subCategoryId } },
      { CategoryContentId: { startsWith: `${subCategoryId},` } },
      { CategoryContentId: { endsWith: `,${subCategoryId}` } },
      { CategoryContentId: { contains: `,${subCategoryId},` } },
    ],
  };
}

async function queryProductsBySubcategory(
  subCategoryName: string,
  params: ProductsQueryParams
): Promise<CategoryProductsResult | null> {
  const { page, limit } = params;

  const subCategory = await prisma.categoryContent.findFirst({
    where: { Slug: subCategoryName },
    include: {
      SEO_CategoryContent: true,
    },
  });

  if (!subCategory) {
    return null;
  }

  const subCategoryId = subCategory.CategoryContentId.toString();
  const where = buildSubcategoryWhere(subCategoryId);

  const totalCount = await prisma.product.count({ where });

  if (totalCount === 0) {
    return null;
  }

  const totalPages = Math.ceil(totalCount / limit);
  const currentPageToUse = page > totalPages ? 1 : page;

  const allSubCategories = await prisma.categoryContent.findMany({
    orderBy: {
      CategoryContentId: "asc",
    },
  });

  const subcategoryMap = buildSubcategoryMap(allSubCategories);

  const products = await prisma.product.findMany({
    where,
    include: CATEGORY_PRODUCT_INCLUDE,
    orderBy: {
      ProductId: "desc",
    },
  });

  if (products.length === 0) {
    return null;
  }

  const productsByCategory = new Map<number, ProductWithCategory[]>();

  for (const product of products) {
    const categoryId = product.Category?.CategoryID;
    if (!categoryId) continue;

    let categoryProducts = productsByCategory.get(categoryId);
    if (!categoryProducts) {
      categoryProducts = [];
      productsByCategory.set(categoryId, categoryProducts);
    }
    categoryProducts.push(product);
  }

  let allProcessedProducts: ProductWithCategory[] = [];

  for (const categoryId of [...productsByCategory.keys()].sort((a, b) => a - b)) {
    const productsInCategory = productsByCategory.get(categoryId);
    if (!productsInCategory) continue;

    const sortedProducts = [...productsInCategory].sort((a, b) => b.ProductId - a.ProductId);
    allProcessedProducts = [...allProcessedProducts, ...sortedProducts];
  }

  const startIndex = (currentPageToUse - 1) * limit;
  const endIndex = Math.min(startIndex + limit, allProcessedProducts.length);
  const paginatedProducts = allProcessedProducts.slice(startIndex, endIndex);

  const data = paginatedProducts.map((product) =>
    enrichFeedItem(product, subcategoryMap, subCategory.Slug)
  );

  const seoDetails = subCategory.SEO_CategoryContent
    ? {
        SEO_Title: subCategory.SEO_CategoryContent.SEO_Title,
        SEO_Description: subCategory.SEO_CategoryContent.SEO_Description,
        SEO_Keywords: subCategory.SEO_CategoryContent.SEO_Keywords,
      }
    : null;

  return {
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
}

export const getProductsBySubcategory = cachedQuery(
  "getProductsBySubcategory",
  queryProductsBySubcategory,
  {
    revalidate: 60,
    tags: [TAGS.products, TAGS.categories],
  }
);

// ---------------------------------------------------------------------------
// /api/products/search
// ---------------------------------------------------------------------------

export interface SearchProductsResult {
  data: SearchFeedItem[];
  pagination: PaginationInfo;
  message?: string;
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function generateSearchVariants(query: string): string[] {
  const normalized = normalizeText(query);
  const variants = new Set<string>();

  variants.add(normalized);
  variants.add(normalized.replace(/\s+/g, ""));
  variants.add(normalized.replace(/\s+/g, "-"));

  const tokens = normalized.split(/\s+/).filter((token) => token.length > 0);
  tokens.forEach((token) => variants.add(token));

  return Array.from(variants).filter((variant) => variant.length > 0);
}

function calculateRelevanceScore(product: ProductWithCategory, query: string): number {
  const searchVariants = generateSearchVariants(query);
  const normalizedQuery = normalizeText(query);
  let score = 0;

  const normalizedType = normalizeText(product.Type || "");
  const normalizedName = normalizeText(product.Name || "");
  const normalizedDesc = normalizeText(product.Description || "");
  const normalizedSlug = normalizeText(product.Slug || "");
  const normalizedSeoTitle = normalizeText(product.SEO_Title || "");

  for (const variant of searchVariants) {
    if (normalizedType === variant) {
      score += 100;
    } else if (normalizedType.includes(variant)) {
      score += 70;
    } else if (normalizedType.startsWith(variant)) {
      score += 80;
    }

    if (normalizedName.includes(variant)) {
      score += 50;
    }

    if (normalizedDesc.includes(variant)) {
      score += 30;
    }

    if (normalizedSlug.includes(variant)) {
      score += 25;
    }

    if (normalizedSeoTitle.includes(variant)) {
      score += 10;
    }
  }

  const queryTokens = normalizedQuery.split(/\s+/).filter((token) => token.length > 1);
  const allTokensMatch = queryTokens.every(
    (token) =>
      normalizedType.includes(token) ||
      normalizedName.includes(token) ||
      normalizedDesc.includes(token)
  );

  if (allTokensMatch && queryTokens.length > 1) {
    score += 40;
  }

  return score;
}

function buildSearchConditions(query: string): Prisma.ProductWhereInput {
  const searchVariants = generateSearchVariants(query);
  const orConditions: Prisma.ProductWhereInput[] = [];

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

async function querySearchProducts(
  query: string,
  params: ProductsQueryParams
): Promise<SearchProductsResult> {
  const { page, limit } = params;

  if (!query || query.trim().length === 0) {
    throw new Error("Invalid search query");
  }

  const searchQuery = query.trim();
  const searchCondition = buildSearchConditions(searchQuery);

  const totalCount = await prisma.product.count({
    where: searchCondition,
  });

  if (totalCount === 0) {
    return {
      data: [],
      pagination: {
        totalCount: 0,
        currentPage: 1,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      },
      message: "محصولی یافت نشد!",
    };
  }

  const totalPages = Math.ceil(totalCount / (limit > 0 ? limit : totalCount));
  const currentPageToUse = page > totalPages ? 1 : page;

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

  const subcategoryMap = buildSubcategoryMap(allSubCategories);

  const products = await prisma.product.findMany({
    where: searchCondition,
    include: CATEGORY_PRODUCT_INCLUDE,
    orderBy: {
      ProductId: "desc",
    },
  });

  const structuredData = new Map<
    number,
    {
      products: ProductWithCategory[];
      subcategories: Map<number, ProductWithCategory[]>;
    }
  >();

  for (const category of allCategories) {
    structuredData.set(category.CategoryID, { products: [], subcategories: new Map() });
  }

  for (const product of products) {
    const categoryId = product.Category?.CategoryID;
    const categoryData = categoryId ? structuredData.get(categoryId) : undefined;

    if (!categoryId || !categoryData) continue;

    categoryData.products.push(product);

    for (const subcatId of parseCategoryContentIds(product)) {
      const subcat = subcategoryMap.get(subcatId);
      if (!subcat) continue;

      let subcatProducts = categoryData.subcategories.get(subcatId);
      if (!subcatProducts) {
        subcatProducts = [];
        categoryData.subcategories.set(subcatId, subcatProducts);
      }
      subcatProducts.push(product);
    }
  }

  let allProcessedProducts: ProductWithCategory[] = [];

  for (const categoryId of [...structuredData.keys()].sort((a, b) => a - b)) {
    const categoryData = structuredData.get(categoryId);
    if (!categoryData || categoryData.products.length === 0) continue;

    const subcategoryIds = [...categoryData.subcategories.keys()].sort((a, b) => a - b);

    for (const subcatId of subcategoryIds) {
      const subcatProducts = categoryData.subcategories.get(subcatId);
      if (!subcatProducts || subcatProducts.length === 0) continue;

      const sortedProducts = [...subcatProducts].sort((a, b) => b.ProductId - a.ProductId);
      allProcessedProducts = [...allProcessedProducts, ...sortedProducts];
    }

    const productsNotInSubcats = categoryData.products.filter((product) => {
      return !parseCategoryContentIds(product).some((id) => categoryData.subcategories.has(id));
    });

    if (productsNotInSubcats.length > 0) {
      const sortedDirectProducts = [...productsNotInSubcats].sort(
        (a, b) => b.ProductId - a.ProductId
      );
      allProcessedProducts = [...allProcessedProducts, ...sortedDirectProducts];
    }
  }

  const processedProductIds = new Set<number>();
  allProcessedProducts = allProcessedProducts.filter((product) => {
    if (processedProductIds.has(product.ProductId)) {
      return false;
    }
    processedProductIds.add(product.ProductId);
    return true;
  });

  const scoredProducts = allProcessedProducts.map((product) => ({
    product,
    score: calculateRelevanceScore(product, searchQuery),
  }));

  scoredProducts.sort((a, b) => b.score - a.score);

  const pageSize = limit > 0 ? limit : totalCount;
  const startIndex = (currentPageToUse - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, scoredProducts.length);
  const paginatedProducts = scoredProducts.slice(startIndex, endIndex);

  const data = paginatedProducts.map(({ product, score }) => ({
    ...enrichFeedItem(product, subcategoryMap),
    _relevanceScore: score,
  }));

  return {
    data,
    pagination: {
      totalCount,
      currentPage: currentPageToUse,
      totalPages,
      hasNextPage: currentPageToUse < totalPages,
      hasPrevPage: currentPageToUse > 1,
    },
  };
}

export const searchProducts = cachedQuery("searchProducts", querySearchProducts, {
  revalidate: 60,
  tags: [TAGS.products, TAGS.categories],
});

// ---------------------------------------------------------------------------
// /api/products/getProductBySlug/:productSlug
// ---------------------------------------------------------------------------

const PRODUCT_DETAIL_INCLUDE = {
  Category: {
    select: {
      Slug: true,
    },
  },
} as const;

type ProductDetailRow = Prisma.ProductGetPayload<{ include: typeof PRODUCT_DETAIL_INCLUDE }>;

export interface ProductBySlugData {
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
  productSlug: string | null;
  categorySlug: string | null;
  subCategorySlug: string | null;
  SEO_Title: string | null;
  SEO_Description: string | null;
  QrCode_key: string | null;
  QrCode_expiryDays: string | null;
  productBlog: string | null;
  Minimum_Amount: number | null;
  Maximum_Amount: number | null;
}

async function queryProductBySlug(productSlug: string): Promise<ProductBySlugData | null> {
  const lowerCaseProductSlug = productSlug.toLowerCase();

  const product: ProductDetailRow | null = await prisma.product.findFirst({
    where: {
      Slug: {
        equals: lowerCaseProductSlug,
        mode: "insensitive",
      },
    },
    include: PRODUCT_DETAIL_INCLUDE,
  });

  if (!product) {
    return null;
  }

  const categoryContentIds = product.CategoryContentId?.split(",") || [];
  const firstCategoryContentId = categoryContentIds[0];

  const subCategorySlug = firstCategoryContentId
    ? (
        await prisma.categoryContent.findFirst({
          where: { CategoryContentId: Number(firstCategoryContentId) },
          select: { Slug: true },
        })
      )?.Slug
    : null;

  return {
    ProductId: product.ProductId,
    Name: product.Name,
    Type: product.Type,
    Price: product.Price,
    Discount: product.Discount,
    CategoryContentId: product.CategoryContentId,
    img1: product.img1,
    img2: product.img2,
    Available: product.Available,
    Description: product.Description,
    CategoryId: product.CategoryId,
    productSlug: product.Slug,
    categorySlug: product.Category?.Slug || null,
    subCategorySlug: subCategorySlug || null,
    SEO_Title: product.SEO_Title,
    SEO_Description: product.SEO_Description,
    QrCode_key: product.QrCode_Key,
    QrCode_expiryDays: product.QrCode_expiryDays,
    productBlog: product.productBlog,
    Minimum_Amount: product.Minimum_Amount,
    Maximum_Amount: product.Maximum_Amount,
  };
}

export const getProductBySlug = cachedQuery("getProductBySlug", queryProductBySlug, {
  revalidate: 60,
  tags: [TAGS.products, TAGS.categories],
});

// ---------------------------------------------------------------------------
// /api/products/getCategoryName/:categoryName & getSubCategoryName/:subCategoryName
// ---------------------------------------------------------------------------

async function queryCategoryName(
  categoryName: string
): Promise<{ categoryName: string | null } | null> {
  const category = await prisma.category.findFirst({
    where: { Slug: categoryName },
    select: { Name: true },
  });

  if (!category) {
    return null;
  }

  return { categoryName: category.Name };
}

export const getCategoryName = cachedQuery("getCategoryName", queryCategoryName, {
  revalidate: 60,
  tags: [TAGS.categories],
});

async function querySubCategoryName(
  subCategoryName: string
): Promise<{ subCategoryName: string | null } | null> {
  const categoryContent = await prisma.categoryContent.findFirst({
    where: {
      Slug: subCategoryName,
    },
    select: {
      Name: true,
    },
  });

  if (!categoryContent) {
    return null;
  }

  return { subCategoryName: categoryContent.Name };
}

export const getSubCategoryName = cachedQuery("getSubCategoryName", querySubCategoryName, {
  revalidate: 60,
  tags: [TAGS.categories],
});

// ---------------------------------------------------------------------------
// /api/products/blogs (category/subcategory TopBlog/BottomBlog/Banner)
// ---------------------------------------------------------------------------

export interface ProductsBlogContent {
  topBlog: string | null;
  bottomBlog: string | null;
  banner: string | null;
}

export interface ProductsBlogQueryParams {
  categorySlug?: string | null;
  subcategorySlug?: string | null;
  page?: number;
}

const EMPTY_PRODUCTS_BLOG: ProductsBlogContent = {
  topBlog: null,
  bottomBlog: null,
  banner: null,
};

async function queryProductsBlogContent(
  params: ProductsBlogQueryParams
): Promise<ProductsBlogContent> {
  const { categorySlug, subcategorySlug } = params;

  if (subcategorySlug) {
    const sub = await prisma.categoryContent.findFirst({
      where: { Slug: subcategorySlug },
      select: { TopBlog: true, BottomBlog: true, Banner: true },
    });

    return {
      topBlog: sub?.TopBlog || null,
      bottomBlog: sub?.BottomBlog || null,
      banner: sub?.Banner || null,
    };
  }

  if (categorySlug) {
    const category = await prisma.category.findFirst({
      where: { Slug: categorySlug },
      select: { TopBlog: true, BottomBlog: true, Banner: true },
    });

    return {
      topBlog: category?.TopBlog || null,
      bottomBlog: category?.BottomBlog || null,
      banner: category?.Banner || null,
    };
  }

  return EMPTY_PRODUCTS_BLOG;
}

export const getProductsBlogContent = cachedQuery(
  "getProductsBlogContent",
  queryProductsBlogContent,
  {
    revalidate: 60,
    tags: [TAGS.products, TAGS.categories],
  }
);
