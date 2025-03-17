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
    console.log("[INFO] Received request to update product specifications");
    const body = await req.json();
    console.log("[DEBUG] Request body:", body);

    const { productId, specs } = body;

    if (!productId || !Array.isArray(specs)) {
      console.warn("[WARN] Invalid input: productId or specs is missing.");
      return NextResponse.json(
        { message: "Invalid input: productId or specs is missing." },
        { status: 400 }
      );
    }

    console.log(
      `[INFO] Fetching existing specifications for product ID ${productId}`
    );
    const existingSpecs = await prisma.productSpecs.findMany({
      where: { ProductId: productId },
    });
    console.log("[DEBUG] Existing specs:", existingSpecs);

    const existingSpecIds = existingSpecs.map((spec) => spec.ProductSpecsId);
    const incomingSpecIds = specs.map((spec) => spec.ProductSpecsId);

    const specsToDelete = existingSpecs.filter(
      (spec) => !incomingSpecIds.includes(spec.ProductSpecsId)
    );

    if (specsToDelete.length > 0) {
      console.log(
        "[INFO] Deleting specifications:",
        specsToDelete.map((s) => s.ProductSpecsId)
      );
      await prisma.productSpecs.deleteMany({
        where: {
          ProductSpecsId: {
            in: specsToDelete.map((spec) => spec.ProductSpecsId),
          },
        },
      });
    }

    for (const spec of specs) {
      if (
        spec.ProductSpecsId &&
        existingSpecIds.includes(spec.ProductSpecsId)
      ) {
        console.log(`[INFO] Updating spec ID ${spec.ProductSpecsId}`);
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
        console.log(`[INFO] Creating new spec for product ID ${productId}`);
        await prisma.productSpecs.create({
          data: {
            ProductId: productId,
            Title: spec.Title,
            Description: spec.Description,
            Available: spec.Available ?? true,
            InsertDate: new Date(),
          },
        });
      }
    }

    console.log("[INFO] Specifications updated successfully.");
    return NextResponse.json(
      { message: "Specifications updated successfully." },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[ERROR] Internal server error:", error);
    return NextResponse.json(
      {
        message: "Internal server error.",
        error: error.response?.data?.message,
      },
      { status: 500 }
    );
  }
}
