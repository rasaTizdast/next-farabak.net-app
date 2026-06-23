import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

/**
 * @swagger
 * /api/faqs/product/{id}:
 *   get:
 *     summary: Get FAQs for a specific product
 *     description: Retrieves all FAQs associated with a specific product ID.
 *     tags:
 *       - FAQs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID
 *     responses:
 *       200:
 *         description: List of FAQs for the product
 *       400:
 *         description: Invalid product ID
 *       500:
 *         description: Server error
 */
export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const faqs = await prisma.fAQs.findMany({
      where: {
        ProductId: productId,
        Available: true,
      },
      select: {
        FAQsId: true,
        Title: true,
        Description: true,
      },
    });

    return NextResponse.json(faqs);
  } catch (error) {
    console.error("Error fetching product FAQs:", error);
    return NextResponse.json({ error: "Failed to fetch product FAQs" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * @swagger
 * /api/faqs/product/{id}:
 *   put:
 *     summary: Update FAQs for a specific product
 *     description: Updates all FAQs for a specific product by deleting existing ones and creating new ones.
 *     tags:
 *       - FAQs
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: array
 *             items:
 *               type: object
 *               properties:
 *                 question:
 *                   type: string
 *                 answer:
 *                   type: string
 *     responses:
 *       200:
 *         description: FAQs updated successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const faqs = await request.json();

    if (!Array.isArray(faqs)) {
      return NextResponse.json({ error: "Invalid input format" }, { status: 400 });
    }

    // If no new FAQs, just return success without deleting
    if (faqs.length === 0) {
      return NextResponse.json({ message: "FAQs updated successfully" });
    }

    // Delete existing FAQs for this product
    await prisma.fAQs.deleteMany({
      where: {
        ProductId: productId,
      },
    });

    // Create new FAQs
    await prisma.fAQs.createMany({
      data: faqs.map((faq) => ({
        Title: faq.question,
        Description: faq.answer,
        ProductId: productId,
        Available: true,
        FilesAddress: "", // Default empty string
      })),
    });

    return NextResponse.json({ message: "FAQs updated successfully" });
  } catch (error) {
    console.error("Error updating product FAQs:", error);
    return NextResponse.json({ error: "Failed to update product FAQs" }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
