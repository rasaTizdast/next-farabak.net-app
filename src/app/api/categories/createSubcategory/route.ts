import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { TAGS } from "@/lib/data/tags";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/categories/createSubcategory:
 *   post:
 *     tags:
 *       - Subcategories
 *     summary: Create a new subcategory
 *     description: Add a new subcategory and its SEO details.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 description: Must be "Subcategory"
 *               data:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   slug:
 *                     type: string
 *                   available:
 *                     type: boolean
 *                   parentCategoryId:
 *                     type: integer
 *                   seoTitle:
 *                     type: string
 *                   seoDescription:
 *                     type: string
 *                   seoKeywords:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Subcategory created successfully
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 */

export async function POST(req: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  if (auth.role !== "Admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, data } = body;

    if (type !== "Subcategory") {
      return NextResponse.json(
        { message: "Invalid type. Must be 'Subcategory'." },
        { status: 400 }
      );
    }

    const {
      name,
      slug,
      available,
      parentCategoryId,
      seoTitle,
      seoDescription,
      seoKeywords,
      topBlog,
      bottomBlog,
      banner,
    } = data;

    if (
      !name ||
      !slug ||
      available === undefined ||
      !parentCategoryId ||
      !seoTitle ||
      !seoDescription ||
      !seoKeywords
    ) {
      return NextResponse.json(
        { message: "Invalid data. Please provide all required fields." },
        { status: 400 }
      );
    }

    const subcategory = await prisma.categoryContent.create({
      data: {
        Name: name,
        Slug: slug,
        Available: available,
        CategoryID: parentCategoryId,
        TopBlog: topBlog ?? null,
        BottomBlog: bottomBlog ?? null,
        Banner: banner ?? null,
        SEO_CategoryContent: {
          create: {
            SEO_Title: seoTitle,
            SEO_Description: seoDescription,
            SEO_Keywords: JSON.stringify(seoKeywords),
          },
        },
      },
    });

    revalidateTag(TAGS.categories, "max");
    revalidateTag(TAGS.products, "max");
    revalidateTag(TAGS.sitemap, "max");
    return NextResponse.json({
      message: "Subcategory created successfully",
      subcategory,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
