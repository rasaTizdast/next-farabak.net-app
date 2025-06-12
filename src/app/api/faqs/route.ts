import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/faqs:
 *   post:
 *     summary: Create multiple FAQs for a product
 *     description: Accepts a list of FAQs and creates records in the database.
 *     tags:
 *       - NewProduct
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payload:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     Title:
 *                       type: string
 *                       example: "What is the warranty period?"
 *                     Description:
 *                       type: string
 *                       example: "The warranty period is 1 year."
 *                     ProductId:
 *                       type: integer
 *                       example: 1
 *                     Available:
 *                       type: boolean
 *                       example: true
 *     responses:
 *       200:
 *         description: Records created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "FAQs created successfully!"
 *                 createdRecords:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: Invalid request payload
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json(
        { message: "Invalid or missing payload" },
        { status: 400 }
      );
    }

    // Batch insert the payload into the database
    const createdRecords = await prisma.fAQs.createMany({
      data: body.map((faq) => ({
        Title: faq.Title,
        Description: faq.Description,
        ProductId: faq.ProductId,
        Available: faq.Available,
        FilesAddress: "", // Default empty string
      })),
      skipDuplicates: true, // Prevent duplicate inserts
    });

    return NextResponse.json({
      message: "FAQs created successfully!",
      createdRecords: createdRecords.count,
    });
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
