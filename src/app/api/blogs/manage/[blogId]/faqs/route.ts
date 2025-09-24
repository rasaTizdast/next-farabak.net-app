import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

import { getCurrentJalaliDate } from "@/utils/jalaliDate";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/blogs/manage/{blogId}/faqs:
 *   get:
 *     summary: Get FAQs for a specific blog by ID (Admin)
 *     description: Fetch all FAQs for a blog by its ID for admin management.
 *     parameters:
 *       - name: blogId
 *         in: path
 *         required: true
 *         description: The ID of the blog.
 *         schema:
 *           type: integer
 *   post:
 *     summary: Create a new FAQ for a blog (Admin)
 *     description: Create a new FAQ entry for a specific blog.
 *     parameters:
 *       - name: blogId
 *         in: path
 *         required: true
 *         description: The ID of the blog.
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               order:
 *                 type: integer
 *               available:
 *                 type: boolean
 */

export async function GET(req: Request, props: { params: Promise<{ blogId: string }> }) {
  const params = await props.params;
  const blogId = parseInt(params.blogId);

  if (isNaN(blogId)) {
    return NextResponse.json({ message: "Invalid blog ID" }, { status: 400 });
  }

  try {
    const faqs = await prisma.blogFAQs.findMany({
      where: { blog_id: blogId },
      orderBy: { order: "asc" },
    });

    console.log(
      `Fetched ${faqs.length} FAQs for blog ${blogId}:`,
      faqs.map((f) => ({ id: f.id, order: f.order, question: f.question.substring(0, 30) + "..." }))
    );

    return NextResponse.json({ faqs });
  } catch (error) {
    console.error("Error fetching blog FAQs:", error);
    return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
  }
}

export async function POST(req: Request, props: { params: Promise<{ blogId: string }> }) {
  const params = await props.params;
  const blogId = parseInt(params.blogId);

  if (isNaN(blogId)) {
    return NextResponse.json({ message: "Invalid blog ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { question, answer, order = 0, available = true } = body;

    if (!question || !answer) {
      return NextResponse.json({ message: "سوال و پاسخ الزامی است" }, { status: 400 });
    }

    // Verify blog exists
    const blog = await prisma.blogs.findUnique({
      where: { id: blogId },
    });

    if (!blog) {
      return NextResponse.json({ message: "بلاگ مورد نظر یافت نشد" }, { status: 404 });
    }

    console.log(`Creating FAQ for blog ${blogId} with order: ${order}`);

    const faq = await prisma.blogFAQs.create({
      data: {
        blog_id: blogId,
        question,
        answer,
        order,
        available,
        created_at: getCurrentJalaliDate(), // Jalali date format (e.g., "1404-06-23")
        updated_at: getCurrentJalaliDate(),
      },
    });

    console.log(`Created FAQ with ID ${faq.id} and order ${faq.order}`);

    return NextResponse.json({ faq }, { status: 201 });
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
  }
}
