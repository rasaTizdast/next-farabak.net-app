import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/productOverview:
 *   post:
 *     summary: Add a new product overview.
 *     description: Accepts product details and an array of features, mapping the features to the database properties dynamically.
 *     tags:
 *       - NewProduct
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ProductId:
 *                 type: integer
 *                 description: The unique ID of the product.
 *                 example: 101
 *               ProductName:
 *                 type: string
 *                 description: The name of the product.
 *                 example: "Smartphone X"
 *               Features:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: An array of product features.
 *                 example: ["Fast charging", "Water-resistant", "AMOLED display", "Dual cameras"]
 *     responses:
 *       200:
 *         description: Successfully added the product overview.
 *       400:
 *         description: Invalid request payload.
 *       500:
 *         description: Server error.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ProductId, ProductName, Features } = body;

    // Validate the input
    if (!ProductId || !ProductName || !Array.isArray(Features)) {
      return NextResponse.json(
        {
          error:
            "Invalid input. Ensure ProductId, ProductName, and Features are provided.",
        },
        { status: 400 }
      );
    }

    // Map features to properties
    const [Property1, Property2, Property3, Property4] = Features;

    // Create a new product overview record
    const newOverview = await prisma.productOverview.create({
      data: {
        ProductId,
        ProductName,
        Property1: Property1 || null,
        Property2: Property2 || null,
        Property3: Property3 || null,
        Property4: Property4 || null,
        Available: true, // Assuming all products are available by default
      },
    });

    return NextResponse.json(newOverview, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
