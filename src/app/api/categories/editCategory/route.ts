import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma"; // Assuming prisma is set up in this path

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

/**
 * @swagger
 * /api/categories/editCategory:
 *   patch:
 *     tags:
 *       - Categories
 *     summary: Update category or subcategory
 *     description: Update a category or a subcategory based on the provided ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Type:
 *                 type: string
 *                 description: Either 'category' or 'subcategory'
 *               CategoryID:
 *                 type: integer
 *               CategoryContentId:
 *                 type: string
 *               Name:
 *                 type: string
 *               Slug:
 *                 type: string
 *               Available:
 *                 type: boolean
 *               SEO_Details:
 *                 type: object
 *                 properties:
 *                   SEO_Title:
 *                     type: string
 *                   SEO_Description:
 *                     type: string
 *                   SEO_Keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       200:
 *         description: Successfully updated category or subcategory
 *       400:
 *         description: Invalid data
 *       500:
 *         description: Internal server error
 */

export async function PATCH(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return NextResponse.json({ message: "Authorization token required" }, { status: 401 });
  }

  const decoded = await verifyToken(token);
  const userRole = decoded.role;

  if (!userRole || userRole !== "Admin") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      Type,
      CategoryID,
      CategoryContentId,
      Name,
      Slug,
      Available,
      SEO_Details,
      TopBlog,
      BottomBlog,
      Banner,
    } = body;

    if (Type === "category") {
      if (!CategoryID || !Name || !Slug || Available === undefined || !SEO_Details) {
        return NextResponse.json({ message: "Invalid data for category" }, { status: 400 });
      }

      const updatedCategory = await prisma.category.update({
        where: { CategoryID }, // Correct unique identifier for category
        data: {
          Name,
          Slug,
          Available,
          ModifyDate: new Date(),
          TopBlog: TopBlog ?? null,
          BottomBlog: BottomBlog ?? null,
          Banner: Banner ?? null,
          SEO_Category: {
            upsert: {
              where: { CategoryID }, // Use CategoryID for the SEO_Category upsert
              create: {
                // The 'create' should contain the relation data, use the field that is related to the model
                SEO_Title: SEO_Details.SEO_Title,
                SEO_Description: SEO_Details.SEO_Description,
                SEO_Keywords: JSON.stringify(SEO_Details.SEO_Keywords),
              },
              update: {
                SEO_Title: SEO_Details.SEO_Title,
                SEO_Description: SEO_Details.SEO_Description,
                SEO_Keywords: JSON.stringify(SEO_Details.SEO_Keywords),
              },
            },
          },
        },
        include: { SEO_Category: true },
      });

      return NextResponse.json({
        message: "Category updated successfully",
        data: updatedCategory,
      });
    } else if (Type === "subcategory") {
      if (
        !CategoryContentId ||
        !CategoryID ||
        !Name ||
        !Slug ||
        Available === undefined ||
        !SEO_Details
      ) {
        return NextResponse.json({ message: "Invalid data for subcategory" }, { status: 400 });
      }

      const updatedSubcategory = await prisma.categoryContent.update({
        where: { CategoryContentId }, // Correct unique identifier for subcategory
        data: {
          Name,
          Slug,
          Available,
          ModifyDate: new Date(),
          TopBlog: TopBlog ?? null,
          BottomBlog: BottomBlog ?? null,
          Banner: Banner ?? null,
          SEO_CategoryContent: {
            upsert: {
              where: { CategoryContentId }, // Use CategoryContentId here
              create: {
                // The 'create' should contain the relation data, use the field that is related to the model
                SEO_Title: SEO_Details.SEO_Title,
                SEO_Description: SEO_Details.SEO_Description,
                SEO_Keywords: JSON.stringify(SEO_Details.SEO_Keywords),
              },
              update: {
                SEO_Title: SEO_Details.SEO_Title,
                SEO_Description: SEO_Details.SEO_Description,
                SEO_Keywords: JSON.stringify(SEO_Details.SEO_Keywords),
              },
            },
          },
        },
        include: { SEO_CategoryContent: true },
      });

      return NextResponse.json({
        message: "Subcategory updated successfully",
        data: updatedSubcategory,
      });
    } else {
      return NextResponse.json({ message: "Invalid Type" }, { status: 400 });
    }
  } catch (error: unknown) {
    // Explicitly type the error
    const errorMessage = (error as Error).message || "Unknown error occurred";
    return NextResponse.json(
      { message: "Internal server error", error: errorMessage },
      { status: 500 }
    );
  }
}
