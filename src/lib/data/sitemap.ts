import { prisma } from "@/lib/prisma";

import { cachedQuery } from "./cache";
import { TAGS } from "./tags";

const staticUrls = [
  "https://farabak.net",
  "https://farabak.net/products",
  "https://farabak.net/support",
  "https://farabak.net/support/download-center",
  "https://farabak.net/support/blog",
  "https://farabak.net/support/faq",
  "https://farabak.net/support/warranty-tracking",
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
        include: {
          Category: {
            select: {
              Slug: true,
            },
          },
        },
      }),

      prisma.category.findMany({
        where: { Available: true },
        select: { Slug: true },
      }),

      prisma.categoryContent.findMany({
        where: { Available: true },
        select: {
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

  const productUrls = await Promise.all(
    products.map(async (product) => {
      const categorySlug = product.Category?.Slug || null;

      const categoryContentIds = product.CategoryContentId
        ? product.CategoryContentId.split(",").map((id) => parseInt(id.trim(), 10))
        : [];

      const subCategory = await prisma.categoryContent.findFirst({
        where: {
          CategoryContentId: { in: categoryContentIds },
        },
      });

      return `https://farabak.net/products/${categorySlug}/${subCategory?.Slug}/${product.Slug}`;
    })
  );

  const categoryUrls = categories.map(
    (category) => `https://farabak.net/products/${category.Slug}`
  );

  const subcategoryUrls = categoryContents.reduce<string[]>((acc, content) => {
    if (content.Category?.Slug) {
      acc.push(`https://farabak.net/products/${content.Category.Slug}/${content.Slug}`);
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

export const getSitemapUrls = cachedQuery("getSitemapUrls", querySitemapUrls, {
  revalidate: 3600,
  tags: [TAGS.sitemap],
});
