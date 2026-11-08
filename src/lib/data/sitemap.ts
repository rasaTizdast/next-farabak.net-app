import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/prisma";

import { buildProductSitemapUrls } from "./sitemap-utils";
import { TAGS } from "./tags";

const staticUrls = [
  "https://farabak.net",
  "https://farabak.net/products",
  "https://farabak.net/support",
  "https://farabak.net/support/download-center",
  "https://farabak.net/support/blog",
  "https://farabak.net/support/faq",
  "https://farabak.net/support/warranty-tracking",
  "https://farabak.net/support/tools",
  "https://farabak.net/support/tools/cctv-storage",
  "https://farabak.net/support/tools/xray-fit",
  "https://farabak.net/support/tools/meeting-room",
  "https://farabak.net/about-us",
  "https://farabak.net/about-us/projects",
  "https://farabak.net/about-us/members",
  "https://farabak.net/about-us/activity",
  "https://farabak.net/contact-us",
];

export interface SitemapResult {
  urls: string[];
}

async function querySitemapUrls(): Promise<SitemapResult> {
  const [products, categories, categoryContents, blogs, blogCategories, projects] =
    await Promise.all([
      prisma.product.findMany({
        where: { Available: true },
        include: {
          Category: {
            select: {
              CategoryID: true,
              Slug: true,
            },
          },
        },
      }),

      prisma.category.findMany({
        where: { Available: true },
        select: { CategoryID: true, Slug: true },
      }),

      prisma.categoryContent.findMany({
        where: { Available: true },
        select: {
          CategoryContentId: true,
          Slug: true,
          CategoryID: true,
          Category: {
            select: {
              Slug: true,
            },
          },
        },
      }),

      prisma.blogs.findMany({
        where: { status: "Published" },
        select: {
          slug: true,
          BlogCategories: {
            select: {
              Categories: {
                select: {
                  slug: true,
                },
              },
            },
          },
        },
      }),

      prisma.categories.findMany({
        select: { slug: true },
      }),

      prisma.projects.findMany({
        where: { IsActive: true },
        select: { Slug: true },
      }),
    ]);

  const productUrls = buildProductSitemapUrls(products, categories, categoryContents);

  const availableCategoryIds = new Set(categories.map((category) => category.CategoryID));
  const categoriesWithProducts = new Set<number>();
  const subcategoriesWithProducts = new Set<string>();

  for (const product of products) {
    const categoryId = product.Category?.CategoryID;
    if (categoryId === undefined || !availableCategoryIds.has(categoryId)) continue;

    categoriesWithProducts.add(categoryId);
    for (const rawId of product.CategoryContentId?.split(",") ?? []) {
      const categoryContentId = Number.parseInt(rawId.trim(), 10);
      if (Number.isInteger(categoryContentId)) {
        subcategoriesWithProducts.add(`${categoryId}:${categoryContentId}`);
      }
    }
  }

  const categoryUrls = categories.flatMap((category) => {
    const slug = category.Slug?.trim();
    if (!slug || !categoriesWithProducts.has(category.CategoryID)) return [];
    return [`https://farabak.net/products/${slug}`];
  });

  const subcategoryUrls = categoryContents.reduce<string[]>((acc, content) => {
    const categorySlug = content.Category?.Slug?.trim();
    const slug = content.Slug?.trim();
    if (
      categorySlug &&
      slug &&
      content.CategoryID !== null &&
      availableCategoryIds.has(content.CategoryID) &&
      subcategoriesWithProducts.has(`${content.CategoryID}:${content.CategoryContentId}`)
    ) {
      acc.push(`https://farabak.net/products/${categorySlug}/${slug}`);
    }
    return acc;
  }, []);

  const blogUrls = blogs.flatMap((blog) => {
    if (blog.BlogCategories && blog.BlogCategories.length > 0) {
      return blog.BlogCategories.map(
        (blogCategory) =>
          `https://farabak.net/support/blog/${blogCategory.Categories.slug}/${blog.slug}`
      );
    }
    return [`https://farabak.net/support/blog/${blog.slug}`];
  });

  const blogCategoryUrls = blogCategories.map(
    (category) => `https://farabak.net/support/blog/${category.slug}`
  );

  const projectUrls = projects.map(
    (project) => `https://farabak.net/about-us/projects/${project.Slug}`
  );

  return {
    urls: [
      ...staticUrls,
      ...productUrls,
      ...categoryUrls,
      ...subcategoryUrls,
      ...blogUrls,
      ...blogCategoryUrls,
      ...projectUrls,
    ],
  };
}

export async function getSitemapUrls(): Promise<SitemapResult> {
  "use cache";
  cacheTag(TAGS.sitemap);
  cacheLife("hours");

  return querySitemapUrls();
}
