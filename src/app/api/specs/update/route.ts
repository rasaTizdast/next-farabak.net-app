import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma"; // Ensure your Prisma client is set up correctly

/**
 * @swagger
 * /api/specs/update:
 *   post:
 *     summary: Create, update, or delete product specifications.
 *     tags:
 *       - Product Specifications
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - specs
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: The ID of the product.
 *               specs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ProductSpecsId:
 *                       type: integer
 *                       description: ID of the specification (optional for new specs).
 *                     Name:
 *                       type: string
 *                       description: The internal name of the specification.
 *                     Title:
 *                       type: string
 *                       description: The display title of the specification.
 *                     Description:
 *                       type: string
 *                       description: Details about the specification.
 *                     Available:
 *                       type: boolean
 *                       description: Whether the specification is currently active.
 *     responses:
 *       200:
 *         description: Specifications updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Specifications updated successfully.
 *       400:
 *         description: Invalid input (e.g., missing productId or specs).
 *       500:
 *         description: Internal server error.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, specs } = body;

    if (!productId) {
      return NextResponse.json({ message: "Product ID is required" }, { status: 400 });
    }

    // Update existing and add new specs
    // First, mark all existing specs as unavailable
    await prisma.productSpecs.updateMany({
      where: {
        ProductId: productId,
      },
      data: {
        Available: false,
      },
    });

    // Process each spec in the provided array
    for (const spec of specs) {
      if (spec.ProductSpecsId && spec.ProductSpecsId > 0) {
        // Update existing spec
        await prisma.productSpecs.update({
          where: {
            ProductSpecsId: spec.ProductSpecsId,
          },
          data: {
            Title: spec.Title,
            Description: spec.Description,
            Available: true,
            ModifyDate: new Date(),
          },
        });
      } else {
        // Create new spec
        await prisma.productSpecs.create({
          data: {
            ProductId: productId,
            Title: spec.Title,
            Description: spec.Description,
            Available: true,
            Name: "", // This field is required but not used in your app's UI
          },
        });
      }
    }

    return NextResponse.json({ message: "Specs updated successfully" });
  } catch (error) {
    console.error("Error updating product specs:", error);
    return NextResponse.json({ message: "Error updating product specs" }, { status: 500 });
  }
}
