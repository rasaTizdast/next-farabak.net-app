import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/blogs/{slug}/faqs:
 *   get:
 *     summary: Get FAQs for a specific blog
 *     description: Fetch all available FAQs for a blog by its slug.
 *     parameters:
 *       - name: slug
 *         in: path
 *         required: true
 *         description: The unique slug of the blog.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: FAQs successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 faqs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       question:
 *                         type: string
 *                       answer:
 *                         type: string
 *                       order:
 *                         type: integer
 *       404:
 *         description: Blog not found.
 *       500:
 *         description: Internal server error.
 */

export async function GET(req: Request, props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const { slug } = params;

  try {
    // First, find the blog by slug to get its ID
    const blog = await prisma.blogs.findUnique({
      where: { slug, status: "Published" },
      select: { id: true },
    });

    if (!blog) {
      return NextResponse.json({ message: "بلاگ مورد نظر یافت نشد" }, { status: 404 });
    }

    // Fetch FAQs for the blog
    const faqs = await prisma.blogFAQs.findMany({
      where: {
        blog_id: blog.id,
        available: true,
      },
      orderBy: { order: "asc" },
      select: {
        id: true,
        question: true,
        answer: true,
        order: true,
      },
    });

    return NextResponse.json({ faqs });
  } catch (error) {
    console.error("Error fetching blog FAQs:", error);
    return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
  }
}
