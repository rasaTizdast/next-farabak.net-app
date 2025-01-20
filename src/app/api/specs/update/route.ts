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

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();

    const { productId, specs } = body;

    // Validate input
    if (!productId || !Array.isArray(specs)) {
      return NextResponse.json(
        { message: "Invalid input: productId or specs is missing." },
        { status: 400 }
      );
    }

    // Fetch existing specs for the product
    const existingSpecs = await prisma.productSpecs.findMany({
      where: { ProductId: productId },
    });

    const existingSpecIds = existingSpecs.map((spec) => spec.ProductSpecsId);
    const incomingSpecIds = specs.map((spec) => spec.ProductSpecsId);

    // Find specs to delete
    const specsToDelete = existingSpecs.filter(
      (spec) => !incomingSpecIds.includes(spec.ProductSpecsId)
    );

    // Delete specs that are no longer in the incoming list
    if (specsToDelete.length > 0) {
      await prisma.productSpecs.deleteMany({
        where: {
          ProductSpecsId: {
            in: specsToDelete.map((spec) => spec.ProductSpecsId),
          },
        },
      });
    }

    // Add or update incoming specs
    for (const spec of specs) {
      if (
        spec.ProductSpecsId &&
        existingSpecIds.includes(spec.ProductSpecsId)
      ) {
        // Update existing spec
        await prisma.productSpecs.update({
          where: { ProductSpecsId: spec.ProductSpecsId },
          data: {
            Name: spec.Name,
            Title: spec.Title,
            Description: spec.Description,
            Available: spec.Available,
            ModifyDate: new Date(),
          },
        });
      } else {
        // Create new spec
        await prisma.productSpecs.create({
          data: {
            ProductId: productId,
            Name: spec.Name,
            Title: spec.Title,
            Description: spec.Description,
            Available: spec.Available ?? true,
            InsertDate: new Date(),
          },
        });
      }
    }

    return NextResponse.json(
      { message: "Specifications updated successfully." },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "Internal server error.", error },
      { status: 500 }
    );
  }
}
