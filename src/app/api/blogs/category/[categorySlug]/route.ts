import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/blogs/category/{categorySlug}:
 *   get:
 *     summary: Retrieve blogs for a specific category
 *     description: Fetch blogs that belong to a specific category identified by its slug. The blogs include details like comments, likes, and associated categories.
 *     tags:
 *       - Blogs
 *     parameters:
 *       - in: path
 *         name: categorySlug
 *         required: true
 *         description: The slug of the category to filter blogs by.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: A list of blogs filtered by the category slug.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 blogs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The unique ID of the blog.
 *                       title:
 *                         type: string
 *                         description: The title of the blog.
 *                       SEO_Title:
 *                         type: string
 *                         description: The SEO-friendly title of the blog.
 *                       slug:
 *                         type: string
 *                         description: The unique slug for the blog.
 *                       image:
 *                         type: string
 *                         description: The URL of the blog's image.
 *                       image_alt:
 *                         type: string
 *                         description: Alternative text for the blog's image.
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: The creation date of the blog.
 *                       status:
 *                         type: string
 *                         description: The status of the blog (e.g., published, draft).
 *                       views_count:
 *                         type: integer
 *                         description: The number of views the blog has received.
 *                       content:
 *                         type: string
 *                         description: The full content of the blog.
 *                       author:
 *                         type: string
 *                         description: The author of the blog.
 *                       SEO_description:
 *                         type: string
 *                         description: The SEO-friendly description of the blog.
 *                       categories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               description: The name of the category.
 *                             slug:
 *                               type: string
 *                               description: The slug of the category.
 *                       comments:
 *                         type: integer
 *                         description: The number of comments on the blog.
 *                       likes:
 *                         type: integer
 *                         description: The number of likes the blog has received.
 *       400:
 *         description: Bad request (e.g., missing or invalid category slug).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message.
 *       500:
 *         description: Server error while fetching blogs.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: The error message.
 */

export async function GET(
  req: Request,
  { params }: { params: { categorySlug: string } }
) {
  try {
    const { categorySlug } = params;

    const blogs = await prisma.blogs.findMany({
      where: {
        status: "Published", // Only return published blogs
        QrCode_key: null, // Only fetch blogs without a QR code key
        BlogCategories: {
          some: {
            Categories: {
              slug: categorySlug,
            },
          },
        },
      },
      include: {
        BlogCategories: {
          include: {
            Categories: true,
          },
        },
        Comments: true,
        Likes: true,
      },
      orderBy: {
        created_at: "desc", // Sort by creation date
      },
    });

    const formattedBlogs = blogs.map((blog) => ({
      id: blog.id,
      title: blog.title,
      SEO_Title: blog.SEO_Title,
      slug: blog.slug,
      image: blog.image_URL,
      image_alt: blog.image_alt,
      created_at: blog.created_at,
      status: blog.status,
      views_count: blog.views_count,
      content: blog.content,
      author: blog.author,
      SEO_description: blog.SEO_description,
      categories: blog.BlogCategories.map((bc) => ({
        name: bc.Categories.name,
        slug: bc.Categories.slug,
      })),
      comments: blog.Comments.length,
      likes: blog.Likes.length,
    }));

    return NextResponse.json({ blogs: formattedBlogs });
  } catch (error) {
    console.error("خطا در دریافت مقالات:", error);
    return NextResponse.json(
      { error: "دریافت مقالات با مشکل مواجه شد" },
      { status: 500 }
    );
  }
}
