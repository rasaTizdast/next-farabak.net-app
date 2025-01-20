import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/productOverview:
 *   post:
 *     summary: Add or update a product overview.
 *     description: Adds a new product overview or updates an existing one based on the ProductId.
 *     tags:
 *       - ProductOverview
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
 *         description: Successfully processed the product overview.
 *       400:
 *         description: Invalid request payload.
 *       500:
 *         description: Server error.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ProductId, ProductName, Features } = body;

    if (!ProductId || !ProductName || !Array.isArray(Features)) {
      return NextResponse.json(
        {
          error:
            "Invalid input. Ensure ProductId, ProductName, and Features are provided.",
        },
        { status: 400 }
      );
    }

    const [Property1, Property2, Property3, Property4] = Features;

    // Check if the overview already exists
    const existingOverview = await prisma.productOverview.findFirst({
      where: { ProductId },
    });

    let response;
    if (existingOverview) {
      // Update the existing overview
      response = await prisma.productOverview.updateMany({
        where: { ProductId },
        data: {
          ProductName,
          Property1: Property1 || null,
          Property2: Property2 || null,
          Property3: Property3 || null,
          Property4: Property4 || null,
        },
      });

      if (response.count === 0) {
        return NextResponse.json(
          { error: "No matching overview found to update." },
          { status: 404 }
        );
      }
    } else {
      // Create a new overview
      response = await prisma.productOverview.create({
        data: {
          ProductId,
          ProductName,
          Property1: Property1 || null,
          Property2: Property2 || null,
          Property3: Property3 || null,
          Property4: Property4 || null,
          Available: true,
        },
      });
    }

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
