import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/blogs/faqs/{faqId}:
 *   put:
 *     summary: Update a FAQ
 *     description: Update an existing FAQ entry.
 *     parameters:
 *       - name: faqId
 *         in: path
 *         required: true
 *         description: The ID of the FAQ.
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
 *   delete:
 *     summary: Delete a FAQ
 *     description: Delete an existing FAQ entry.
 *     parameters:
 *       - name: faqId
 *         in: path
 *         required: true
 *         description: The ID of the FAQ.
 *         schema:
 *           type: integer
 */

export async function PUT(req: Request, props: { params: Promise<{ faqId: string }> }) {
  const params = await props.params;
  const faqId = parseInt(params.faqId);

  if (isNaN(faqId)) {
    return NextResponse.json({ message: "Invalid FAQ ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { question, answer, order, available } = body;

    // Only validate question and answer if they are being updated
    if (question !== undefined && !question.trim()) {
      return NextResponse.json({ message: "سوال نمی‌تواند خالی باشد" }, { status: 400 });
    }
    if (answer !== undefined && !answer.trim()) {
      return NextResponse.json({ message: "پاسخ نمی‌تواند خالی باشد" }, { status: 400 });
    }

    const faq = await prisma.blogFAQs.update({
      where: { id: faqId },
      data: {
        question: question !== undefined ? question : undefined,
        answer: answer !== undefined ? answer : undefined,
        order: order !== undefined ? order : undefined,
        available: available !== undefined ? available : undefined,
        updated_at: new Date().toISOString().split("T")[0], // YYYY-MM-DD format
      },
    });

    return NextResponse.json({ faq });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    if ((error as any).code === "P2025") {
      return NextResponse.json({ message: "FAQ مورد نظر یافت نشد" }, { status: 404 });
    }
    return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ faqId: string }> }) {
  const params = await props.params;
  const faqId = parseInt(params.faqId);

  if (isNaN(faqId)) {
    return NextResponse.json({ message: "Invalid FAQ ID" }, { status: 400 });
  }

  try {
    await prisma.blogFAQs.delete({
      where: { id: faqId },
    });

    return NextResponse.json({ message: "FAQ با موفقیت حذف شد" });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    if ((error as any).code === "P2025") {
      return NextResponse.json({ message: "FAQ مورد نظر یافت نشد" }, { status: 404 });
    }
    return NextResponse.json({ message: "خطای داخلی سرور" }, { status: 500 });
  }
}
