// app/api/products/getAllProducts/route.ts

import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../lib/db";

/**
 * @swagger
 * /api/products/getAllProducts:
 *   get:
 *     tags:
 *       - Products
 *     summary: Get all products
 *     description: Returns a list of all products in the database.
 *     responses:
 *       200:
 *         description: A list of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ProductId:
 *                     type: integer
 *                   Name:
 *                     type: string
 *                   Type:
 *                     type: string
 *                   Price:
 *                     type: number
 *                   Discount:
 *                     type: number
 *                   CategoryContentId:
 *                     type: string
 *                   img1:
 *                     type: string
 *                   img2:
 *                     type: string
 *                   Available:
 *                     type: boolean
 *                   Description:
 *                     type: string
 *                   CategoryId:
 *                     type: integer
 *       500:
 *         description: Internal server error
 */
export async function GET() {
  try {
    const pool = await connectToDatabase();
    const result = await pool.request().query("SELECT * FROM Support.Product");

    // Check if no products are found
    if (result.recordset.length === 0) {
      return new NextResponse("No products found", { status: 404 });
    }

    return NextResponse.json(result.recordset);
  } catch (error) {
    console.error("Error fetching products: ", error);
    return new NextResponse("Failed to fetch products", { status: 500 });
  }
}
