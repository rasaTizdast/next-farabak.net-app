import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust this path to where you initialize Prisma in your project

export const dynamic = "force-dynamic";

/**
 * @swagger
 * /api/productOverviewDetails/getAll:
 *   get:
 *     summary: Get all overview details
 *     description: Retrieve all entries from the Master_ProductOverviewDetails table, returning the ProductOverviewDetailsId, Title, Img, and Description fields for each entry.
 *     tags:
 *       - ProductOverviewDetails
 *     responses:
 *       200:
 *         description: Successfully retrieved overview details.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ProductOverviewDetailsId:
 *                     type: number
 *                     description: The Id of the product overview.
 *                     example: 3
 *                   Title:
 *                     type: string
 *                     description: The name of the product overview.
 *                     example: "Product A"
 *                   Img:
 *                     type: string
 *                     description: The image URL of the product overview.
 *                     example: "/images/product-a.png"
 *                   Description:
 *                     type: string
 *                     description: A description of the product overview.
 *                     example: "This is the description for Product A."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: Error message.
 *                   example: "Failed to fetch overview details."
 */

export async function GET() {
  try {
    // Fetch the data from the database
    const overviewDetails = await prisma.master_ProductOverviewDetails.findMany(
      {
        select: {
          ProductOverviewDetailsId: true,
          Title: true,
          Img: true,
          Description: true,
        },
      }
    );

    // Return the data as JSON
    return NextResponse.json(overviewDetails);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch overview details" },
      { status: 500 }
    );
  }
}
