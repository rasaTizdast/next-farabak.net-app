import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

/**
 * @swagger
 * /api/categories/createCategory:
 *   post:
 *     tags:
 *       - Categories
 *     summary: Create a new category
 *     description: Adds a new category and its SEO details to the database.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "Category"
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
 *       201:
 *         description: Successfully created category
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json(
      { message: "Authorization token required" },
      { status: 401 }
    );
  }

  const decoded = await verifyToken(token);
  const userRole = decoded.role;

  if (!userRole || userRole !== "Admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type, data } = body;
    const {
      name,
      slug,
      available,
      parentCategoryId,
      seoTitle,
      seoDescription,
      seoKeywords,
    } = data;

    if (type !== "Category" || !name || !slug || available === undefined) {
      return NextResponse.json({ message: "Invalid data" }, { status: 400 });
    }

    // Insert into Support.Category and Support.SEO_Category
    const category = await prisma.category.create({
      data: {
        Name: name,
        Slug: slug,
        Available: available,
        Category_groupId: parentCategoryId,
        SEO_Category: {
          create: {
            SEO_Title: seoTitle,
            SEO_Description: seoDescription,
            SEO_Keywords: seoKeywords.join(","),
          },
        },
      },
    });

    return NextResponse.json(
      { message: "Category created successfully", category },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
