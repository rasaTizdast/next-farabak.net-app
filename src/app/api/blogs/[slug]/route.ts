import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

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
        Comments: true, // Fetch comments related to the blog
        Likes: true, // Fetch likes related to the blog
      },
    });

    if (!blog) {
      return NextResponse.json({ message: "بلاگ مورد نظر یافت نشد" }, { status: 404 });
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
        QrCode_key: blog.QrCode_key,
        QrCode_expiryDays: blog.QrCode_expiryDays,
      },
      categories: blog.BlogCategories.map((category) => ({
        id: category.Categories.id,
        name: category.Categories.name,
        slug: category.Categories.slug,
      })),
      comments: blog.Comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
      })),
      likes: blog.Likes.length,
      media: media.map((item) => ({
        id: item.id,
        media_type: item.media_type,
        media_URL: item.media_URL,
        media_alt: item.media_alt,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching blog details:", error);
    return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
  }
}
