import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust based on your Prisma client location

/**
 * @swagger
 * /api/blogs:
 *   get:
 *     summary: Retrieve all blogs with their related data.
 *     description: Fetches all blogs, including categories, comments count, and likes count, sorted by creation date.
 *     tags:
 *       - Blogs
 *     responses:
 *       200:
 *         description: A list of blogs with their details.
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
 *                         description: Unique identifier for the blog.
 *                         example: 1
 *                       title:
 *                         type: string
 *                         description: The title of the blog.
 *                         example: First Blog
 *                       SEO_Title:
 *                         type: string
 *                         description: SEO title for the blog.
 *                         example: SEO Title for First Blog
 *                       slug:
 *                         type: string
 *                         description: Unique slug for the blog.
 *                         example: first-blog
 *                       created_at:
 *                         type: string
 *                         format: date-time
 *                         description: Creation date of the blog.
 *                         example: 2025-01-22
 *                       status:
 *                         type: string
 *                         description: The publication status of the blog (e.g., Draft, Published).
 *                         example: Published
 *                       views_count:
 *                         type: integer
 *                         description: The number of views the blog has received.
 *                         example: 120
 *                       content:
 *                         type: string
 *                         description: The main content of the blog.
 *                         example: This is the first blog content.
 *                       author:
 *                         type: string
 *                         description: The author of the blog.
 *                         example: John Doe
 *                       SEO_description:
 *                         type: string
 *                         description: A short description for SEO purposes.
 *                         example: A short description for the first blog.
 *                       categories:
 *                         type: array
 *                         description: List of category names associated with the blog.
 *                         items:
 *                           type: string
 *                         example: ["Technology", "Programming"]
 *                       comments:
 *                         type: integer
 *                         description: The number of comments on the blog.
 *                         example: 5
 *                       likes:
 *                         type: integer
 *                         description: The number of likes on the blog.
 *                         example: 10
 *       500:
 *         description: Internal Server Error.
 */

export async function GET() {
  try {
    const blogs = await prisma.blogs.findMany({
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
        created_at: "desc", // Sort by creation date (adjust as needed)
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
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
