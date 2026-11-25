import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/blogs/{slug}:
 *   get:
 *     summary: Get blog details by slug
 *     description: Fetch detailed information about a blog, including categories, comments, likes, and media, by its slug.
 *     parameters:
 *     tags:
 *       - Blogs
 *       - name: slug
 *         in: path
 *         required: true
 *         description: The unique slug of the blog.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Blog details successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blog:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     SEO_Title:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     created_at:
 *                       type: string
 *                     status:
 *                       type: string
 *                     views_count:
 *                       type: integer
 *                     content:
 *                       type: string
 *                     author:
 *                       type: string
 *                     SEO_description:
 *                       type: string
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       slug:
 *                         type: string
 *                 comments:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       created_at:
 *                         type: string
 *                 likes:
 *                   type: integer
 *                 media:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       media_type:
 *                         type: string
 *                       media_URL:
 *                         type: string
 *                       media_alt:
 *                         type: string
 *       404:
 *         description: Blog not found.
 *       500:
 *         description: Internal server error.
 */

export async function GET(req: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  try {
    // Find the blog by slug
    const blog = await prisma.blogs.findUnique({
      where: { slug, status: "Published" },
      include: {
        BlogCategories: {
          include: {
            Categories: true, // Fetch categories related to the blog
          },
        },
        publicComments: {
          where: { status: "APPROVED", parentId: null },
          orderBy: [{ createdAt: "desc" }, { id: "desc" }],
          take: 20,
          select: { id: true, body: true, publishedAt: true },
        },
        _count: {
          select: {
            publicComments: { where: { status: "APPROVED", parentId: null } },
          },
        },
        Likes: true, // Fetch likes related to the blog
        BlogFAQs: {
          where: { available: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!blog) {
      return NextResponse.json({ message: "بلاگ مورد نظر یافت نشد" }, { status: 404 });
    }

    if (blog.QrCode_key) {
      const url = new URL(req.url);
      const suppliedKey = url.searchParams.get("key");
      const expiry = blog.QrCode_expiryDays ? new Date(blog.QrCode_expiryDays) : null;
      if (
        suppliedKey !== blog.QrCode_key ||
        (expiry && (Number.isNaN(expiry.getTime()) || Date.now() > expiry.getTime()))
      ) {
        return NextResponse.json({ message: "بلاگ مورد نظر یافت نشد" }, { status: 404 });
      }
    }

    // Fetch related media using the blog ID
    const media = await prisma.media.findMany({
      where: { blog_id: blog.id },
    });

    // Structure the response
    const response = {
      blog: {
        id: blog.id,
        title: blog.title,
        SEO_Title: blog.SEO_Title,
        slug: blog.slug,
        created_at: blog.created_at,
        status: blog.status,
        views_count: blog.views_count,
        content: blog.content,
        author: blog.author,
        SEO_description: blog.SEO_description,
        image_URL: blog.image_URL,
        image_alt: blog.image_alt,
      },
      categories: blog.BlogCategories.map((category) => ({
        id: category.Categories.id,
        name: category.Categories.name,
        slug: category.Categories.slug,
      })),
      comments: blog.QrCode_key
        ? []
        : blog.publicComments.map((comment) => ({
            id: comment.id,
            content: comment.body,
            created_at: comment.publishedAt?.toISOString() ?? null,
          })),
      comments_count: blog.QrCode_key ? 0 : blog._count.publicComments,
      likes: blog.Likes.length,
      media: media.map((item) => ({
        id: item.id,
        media_type: item.media_type,
        media_URL: item.media_URL,
        media_alt: item.media_alt,
      })),
      faqs: blog.BlogFAQs.map((faq) => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        order: faq.order,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching blog details:", error);
    return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
  }
}
