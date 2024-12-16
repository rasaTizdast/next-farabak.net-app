import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

// Function to verify JWT token
async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

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

    const pool = await connectToDatabase();

    // Fetch the last CategoryContentId (or calculate the next ID based on the max value)
    const lastIdResult = await pool
      .request()
      .query(
        `SELECT MAX(CategoryContentId) AS LastId FROM Support.CategoryContent`
      );

    const lastCategoryContentId = lastIdResult.recordset[0]?.LastId || 0;
    const nextCategoryContentId = lastCategoryContentId + 1;

    // Insert into the Subcategory table with the manually incremented ID
    await pool
      .request()
      .input("CategoryContentId", nextCategoryContentId) // Use the incremented ID
      .input("Name", name)
      .input("Slug", slug)
      .input("Available", available)
      .input("CategoryID", parentCategoryId).query(`
          INSERT INTO Support.CategoryContent (CategoryContentId, Name, Slug, Available, CategoryID, InsertDate)
          VALUES (@CategoryContentId, @Name, @Slug, @Available, @CategoryID, GETDATE())
        `);

    // Insert SEO details for the subcategory
    await pool
      .request()
      .input("CategoryContentId", nextCategoryContentId) // Use the same ID for SEO details
      .input("SEO_Title", seoTitle)
      .input("SEO_Description", seoDescription)
      .input("SEO_Keywords", JSON.stringify(seoKeywords)).query(`
          INSERT INTO Support.SEO_CategoryContent (CategoryContentId, SEO_Title, SEO_Description, SEO_Keywords)
          VALUES (@CategoryContentId, @SEO_Title, @SEO_Description, @SEO_Keywords)
        `);

    return NextResponse.json({ message: "Subcategory created successfully" });
  } catch (error) {
    console.error("Error creating subcategory:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
