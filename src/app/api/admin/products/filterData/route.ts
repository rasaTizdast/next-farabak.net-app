import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db"; // Adjust based on your project structure

/**
 * @swagger
 * /api/admin/products/filterData:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get categories with subcategories
 *     description: Returns all categories with their corresponding subcategories from the Support.Category and Support.CategoryContent tables.
 *     responses:
 *       200:
 *         description: A list of categories with subcategories.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       CategoryID:
 *                         type: string
 *                       Name:
 *                         type: string
 *                       subCategories:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             CategoryContentID:
 *                               type: string
 *                             Name:
 *                               type: string
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    const pool = await connectToDatabase();

    // Fetch Categories and SubCategories using JOIN
    const query = `
      SELECT 
        c.CategoryID, 
        c.Name AS CategoryName,
        sc.CategoryContentID, 
        sc.Name AS SubCategoryName
      FROM Support.Category c
      LEFT JOIN Support.CategoryContent sc ON c.CategoryID = sc.CategoryID
      ORDER BY c.Name, sc.Name;
    `;

    const result = await pool.request().query(query);

    // Define types for category and subcategory
    interface SubCategory {
      CategoryContentID: string;
      Name: string;
    }

    interface Category {
      CategoryID: string;
      Name: string;
      subCategories: SubCategory[];
    }

    // Grouping subcategories by category
    const categories: Category[] = result.recordset.reduce<Category[]>(
      (acc, row) => {
        const { CategoryID, CategoryName, CategoryContentID, SubCategoryName } =
          row;
        let category = acc.find((cat) => cat.CategoryID === CategoryID);

        if (!category) {
          category = {
            CategoryID,
            Name: CategoryName,
            subCategories: [],
          };
          acc.push(category);
        }

        if (CategoryContentID) {
          category.subCategories.push({
            CategoryContentID,
            Name: SubCategoryName,
          });
        }

        return acc;
      },
      []
    );

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories and subcategories:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
