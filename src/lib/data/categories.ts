import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { cachedQuery } from "./cache";
import { TAGS } from "./tags";

const categoryInclude = {
  SEO_Category: true,
  CategoryContent: {
    include: {
      SEO_CategoryContent: true,
    },
  },
} as const;

type CategoryWithContent = Prisma.CategoryGetPayload<{ include: typeof categoryInclude }>;
type CategoryContentWithSeo = Prisma.CategoryContentGetPayload<{
  include: typeof categoryInclude.CategoryContent.include;
}>;

export interface SeoFallback {
  SEO_Title: null;
  SEO_Description: null;
  SEO_Keywords: null;
}

const SEO_FALLBACK: SeoFallback = {
  SEO_Title: null,
  SEO_Description: null,
  SEO_Keywords: null,
};

export type CategoryTreeCategory = CategoryWithContent & {
  Link: string;
  SEO_Details: CategoryWithContent["SEO_Category"] | SeoFallback;
  Banner: string | null;
  Subcategories: CategoryTreeSubcategory[];
};

export type CategoryTreeSubcategory = CategoryContentWithSeo & {
  Link: string;
  SEO_Details: CategoryContentWithSeo["SEO_CategoryContent"] | SeoFallback;
  Banner: string | null;
};

async function queryAllCategories(): Promise<CategoryTreeCategory[]> {
  const categories = await prisma.category.findMany({
    orderBy: { CategoryID: "asc" },
    include: categoryInclude,
  });

  return categories.map((category): CategoryTreeCategory => {
    const subcategoriesWithSeo = category.CategoryContent.map((sub) => ({
      ...sub,
      Link: `/products/${category.Slug}/${sub.Slug}`,
      SEO_Details: sub.SEO_CategoryContent || SEO_FALLBACK,
      Banner: sub.Banner || null,
    }));

    return {
      ...category,
      Link: `/products/${category.Slug}`,
      SEO_Details: category.SEO_Category || SEO_FALLBACK,
      Banner: category.Banner || null,
      Subcategories: subcategoriesWithSeo,
    };
  });
}

/**
 * All categories with their SEO details and (enriched) subcategories.
 * Mirrors `GET /api/categories/getAll`. Consumers filter `Available` themselves.
 */
export const getAllCategories = cachedQuery("getAllCategories", queryAllCategories, {
  revalidate: 60,
  tags: [TAGS.categories],
});
