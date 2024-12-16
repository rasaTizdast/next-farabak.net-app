import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";
import { jwtVerify } from "jose";
import { ConnectionPool } from "mssql";

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

    const {
      Type,
      CategoryID,
      CategoryContentId,
      Name,
      Slug,
      Available,
      SEO_Details,
    } = body;

    if (Type === "category") {
      if (
        !CategoryID ||
        !Name ||
        !Slug ||
        Available === undefined ||
        !SEO_Details
      ) {
        return NextResponse.json(
          { message: "Invalid data for category" },
          { status: 400 }
        );
      }

      // Update category
      const result = await pool
        .request()
        .input("CategoryID", CategoryID)
        .input("Name", Name)
        .input("Slug", Slug)
        .input("Available", Available).query(`
            UPDATE Support.Category
            SET Name = @Name, Slug = @Slug, Available = @Available
            WHERE CategoryID = @CategoryID
          `);

      if (result.rowsAffected[0] === 0) {
        return NextResponse.json(
          { message: "Category not found" },
          { status: 404 }
        );
      }

      // Upsert SEO details
      await upsertSEO(pool, {
        CategoryID,
        CategoryContentId: null,
        ...SEO_Details,
      });

      return NextResponse.json({ message: "Category updated successfully" });
    } else if (Type === "subcategory") {
      if (
        !CategoryContentId ||
        !CategoryID ||
        !Name ||
        !Slug ||
        Available === undefined ||
        !SEO_Details
      ) {
        return NextResponse.json(
          { message: "Invalid data for subcategory" },
          { status: 400 }
        );
      }

      // Update subcategory
      const result = await pool
        .request()
        .input("CategoryContentId", CategoryContentId)
        .input("CategoryID", CategoryID)
        .input("Name", Name)
        .input("Slug", Slug)
        .input("Available", Available).query(`
            UPDATE Support.CategoryContent
            SET Name = @Name, Slug = @Slug, Available = @Available
            WHERE CategoryContentId = @CategoryContentId AND CategoryID = @CategoryID
          `);

      if (result.rowsAffected[0] === 0) {
        return NextResponse.json(
          { message: "Subcategory not found" },
          { status: 404 }
        );
      }

      // Upsert SEO details
      await upsertSEO(pool, {
        CategoryID,
        CategoryContentId,
        ...SEO_Details,
      });

      return NextResponse.json({ message: "Subcategory updated successfully" });
    } else {
      return NextResponse.json({ message: "Invalid Type" }, { status: 400 });
    }
  } catch (error) {
    console.error("Error updating category or subcategory:", error);
    return new NextResponse("Failed to update", { status: 500 });
  }
}

async function upsertSEO(
  pool: ConnectionPool,
  {
    CategoryID,
    CategoryContentId,
    SEO_Title,
    SEO_Description,
    SEO_Keywords,
  }: {
    CategoryID: number;
    CategoryContentId: number | null;
    SEO_Title: string;
    SEO_Description: string;
    SEO_Keywords: string[];
  }
) {
  const transaction = pool.transaction(); // Start a transaction

  try {
    // Begin transaction
    await transaction.begin();

    let existingSEO: any;

    if (CategoryContentId) {
      // Subcategory SEO details
      existingSEO = await transaction
        .request()
        .input("CategoryContentId", CategoryContentId).query(`
          SELECT [SEO_CategoryContentId], [CategoryContentId], [SEO_Title], [SEO_Description], [SEO_Keywords]
          FROM [Support].[SEO_CategoryContent]
          WHERE CategoryContentId = @CategoryContentId
        `);
    } else {
      // Category SEO details
      existingSEO = await transaction.request().input("CategoryID", CategoryID)
        .query(`
          SELECT [SEO_CategoryId], [CategoryID], [SEO_Title], [SEO_Description], [SEO_Keywords]
          FROM [Support].[SEO_Category]
          WHERE CategoryID = @CategoryID
        `);
    }

    if (existingSEO.recordset.length > 0) {
      // Update existing SEO details
      await transaction
        .request()
        .input("SEO_Title", SEO_Title)
        .input("SEO_Description", SEO_Description)
        .input("SEO_Keywords", JSON.stringify(SEO_Keywords))
        .input("CategoryContentId", CategoryContentId)
        .input("CategoryID", CategoryID).query(`
          UPDATE ${
            CategoryContentId
              ? "Support.SEO_CategoryContent"
              : "Support.SEO_Category"
          }
          SET SEO_Title = @SEO_Title, SEO_Description = @SEO_Description, SEO_Keywords = @SEO_Keywords
          WHERE ${CategoryContentId ? "CategoryContentId" : "CategoryID"} = 
          ${CategoryContentId ? "@CategoryContentId" : "@CategoryID"}
        `);
    } else {
      // Insert new SEO details if they don't exist
      await transaction
        .request()
        .input("SEO_Title", SEO_Title)
        .input("SEO_Description", SEO_Description)
        .input("SEO_Keywords", JSON.stringify(SEO_Keywords))
        .input("CategoryContentId", CategoryContentId)
        .input("CategoryID", CategoryID).query(`
          INSERT INTO ${
            CategoryContentId
              ? "Support.SEO_CategoryContent"
              : "Support.SEO_Category"
          }
          (SEO_Title, SEO_Description, SEO_Keywords, ${
            CategoryContentId ? "CategoryContentId" : "CategoryID"
          })
          VALUES (@SEO_Title, @SEO_Description, @SEO_Keywords, 
          ${CategoryContentId ? "@CategoryContentId" : "@CategoryID"})
        `);
    }

    // Commit the transaction
    await transaction.commit();
    return { message: "SEO details updated/created successfully" };
  } catch (error) {
    // Rollback if there's an error
    await transaction.rollback();
    console.error("Error updating or inserting SEO details:", error);
    throw new Error(
      "Failed to update SEO details. All changes have been rolled back."
    );
  }
}
