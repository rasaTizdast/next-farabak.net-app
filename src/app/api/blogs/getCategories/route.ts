import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/blogs/getCategories:
 *   get:
 *     summary: Retrieve all Blogs categories
 *     description: Get a list of all Blog categories in the Blog schema.
 *     tags:
 *       - Blogs
 *     responses:
 *       200:
 *         description: A list of categories.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: "Technology"
 *                   slug:
 *                     type: string
 *                     example: "technology"
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    const categories = await prisma.categories.findMany();

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error("خطا در دریافت دسته‌بندی‌ها:", error);
    return NextResponse.json(
      { error: "خطایی هنگام دریافت دسته‌بندی‌ها رخ داده است." },
      { status: 500 }
    );
  }
}
