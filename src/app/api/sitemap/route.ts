import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/sitemap/products:
 *   get:
 *     tags:
 *       - sitemap
 *     summary: Get all URLs for sitemap
 *     description: Returns URLs for products, categories, subcategories, blogs, blog categories, and projects for generating a sitemap.
 *     responses:
 *       200:
 *         description: A list of URLs for the sitemap
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *                 categoryUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *                 blogUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *                 projectUrls:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    // Fetch all the data we need in parallel
    const [products, categories, categoryContents, blogs, blogCategories, projects] =
      await Promise.all([
        // Products
        prisma.product.findMany({
          include: {
            Category: {
              select: {
                Slug: true,
              },
            },
          },
        }),

        // Categories
        prisma.category.findMany({
          where: { Available: true },
          select: { Slug: true },
        }),

        // Subcategories
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

        // Blogs
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

        // Blog Categories
        prisma.categories.findMany({
          select: { slug: true },
        }),

        // Projects
        prisma.projects.findMany({
          where: { IsActive: true },
          select: { Slug: true },
        }),
      ]);

    // Generate product URLs
    const productUrls = await Promise.all(
      products.map(async (product) => {
        const categorySlug = product.Category?.Slug || null;

        // Parse CategoryContentId string
        const categoryContentIds = product.CategoryContentId
          ? product.CategoryContentId.split(",").map((id) => parseInt(id.trim(), 10))
          : [];

        // Fetch first matching subcategory
        const subCategory = await prisma.categoryContent.findFirst({
          where: {
            CategoryContentId: { in: categoryContentIds },
          },
        });

        return `https://farabak.net/products/${categorySlug}/${subCategory?.Slug}/${product.Slug}`;
      })
    );

    // Generate category URLs
    const categoryUrls = categories.map(
      (category) => `https://farabak.net/products/${category.Slug}`
    );

    // Generate subcategory URLs
    const subcategoryUrls = categoryContents
      .filter((content) => content.Category?.Slug) // Only include subcategories with valid parent categories
      .map((content) => `https://farabak.net/products/${content.Category?.Slug}/${content.Slug}`);

    // Generate blog URLs
    const blogUrls = blogs.flatMap((blog) => {
      // If blog has categories, create URLs for each category
      if (blog.BlogCategories && blog.BlogCategories.length > 0) {
        return blog.BlogCategories.map(
          (blogCategory) =>
            `https://farabak.net/support/blog/${blogCategory.Categories.slug}/${blog.slug}`
        );
      }
      // If no categories, create URL without category (fallback)
      return [`https://farabak.net/support/blog/${blog.slug}`];
    });

    // Generate blog category URLs
    const blogCategoryUrls = blogCategories.map(
      (category) => `https://farabak.net/support/blog/${category.slug}`
    );

    // Generate project URLs
    const projectUrls = projects.map(
      (project) => `https://farabak.net/about-us/projects/${project.Slug}`
    );

    // Static URLs
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

    // Combine all URLs
    const allUrls = {
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

    return NextResponse.json(allUrls);
  } catch (error) {
    return new NextResponse(`Failed to generate sitemap, ${error!}`, { status: 500 });
  }
}
