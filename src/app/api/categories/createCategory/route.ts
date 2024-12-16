import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
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
  const cookieStore = cookies();
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
    const pool = await connectToDatabase();
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

    // Insert into Support.Category
    const insertCategoryResult = await pool
      .request()
      .input("Name", name)
      .input("Slug", slug)
      .input("Available", available)
      .input("ParentCategoryId", parentCategoryId).query(`
        INSERT INTO Support.Category (Name, Slug, Available, Category_groupId, InsertDate, ModifyDate)
        OUTPUT INSERTED.CategoryID
        VALUES (@Name, @Slug, @Available, @ParentCategoryId, GETDATE(), GETDATE())
      `);

    if (
      !insertCategoryResult.recordset ||
      insertCategoryResult.recordset.length === 0
    ) {
      return NextResponse.json(
        { message: "Failed to insert category" },
        { status: 500 }
      );
    }

    const categoryId = insertCategoryResult.recordset[0].CategoryID;

    // Insert into Support.SEO_Category
    await pool
      .request()
      .input("CategoryID", categoryId)
      .input("SEO_Title", seoTitle)
      .input("SEO_Description", seoDescription)
      .input("SEO_Keywords", JSON.stringify(seoKeywords)).query(`
        INSERT INTO Support.SEO_Category (CategoryID, SEO_Title, SEO_Description, SEO_Keywords)
        VALUES (@CategoryID, @SEO_Title, @SEO_Description, @SEO_Keywords)
      `);

    return NextResponse.json(
      { message: "Category created successfully" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
