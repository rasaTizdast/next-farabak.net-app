import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export const revalidate = 300; // Revalidate every 5 minutes (300 seconds)

/**
 * @swagger
 * /api/faqs/general:
 *   get:
 *     summary: Get all available general FAQs
 *     description: Retrieves all available FAQs from the database without pagination.
 *     tags:
 *       - FAQs
 *     responses:
 *       200:
 *         description: List of FAQs retrieved successfully
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
 *                       FaqDetailsid:
 *                         type: integer
 *                       Q:
 *                         type: string
 *                       A:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    const faqs = await prisma.faqDetails.findMany({
      where: {
        Available: true,
      },
      orderBy: {
        InsertDate: "desc",
      },
      select: {
        FaqDetailsid: true,
        Q: true,
        A: true,
      },
    });

    return NextResponse.json({ faqs }, { status: 200 });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { message: "Internal server error", error: String(error) },
      { status: 500 }
    );
  }
}
