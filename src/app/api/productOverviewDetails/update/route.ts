import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma"; // Adjust path to your Prisma instance

/**
 * @swagger
 * /api/productOverviewDetails/update:
 *   put:
 *     summary: Update product overview details.
 *     description: Updates the product overview details by adding or removing associations with the provided details.
 *     tags:
 *       - productOverviewDetails
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productId:
 *                 type: integer
 *                 description: ID of the product to update.
 *                 example: 101
 *               selectedDetails:
 *                 type: array
 *                 description: Array of details to associate with the product.
 *                 items:
 *                   type: object
 *                   properties:
 *                     ProductOverviewDetailsId:
 *                       type: integer
 *                       description: ID of the product overview detail.
 *                       example: 201
 *               ProductName:
 *                 type: string
 *                 description: Name of the product.
 *                 example: "Sample Product"
 *     responses:
 *       200:
 *         description: Product overview details updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Product overview details updated successfully"
 *       400:
 *         description: Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid input. 'productId' and 'selectedDetails' are required."
 *       500:
 *         description: Internal server error.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error. Please try again later."
 */

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { productId, selectedDetails, ProductName } = body;

    // Validate input
    if (!productId || !Array.isArray(selectedDetails) || !ProductName) {
      return NextResponse.json(
        {
          error: "Invalid input. 'productId' and 'selectedDetails' are required.",
        },
        { status: 400 }
      );
    }

    // Fetch current overview details for the product
    const currentDetails = await prisma.details_ProductOverviewDetails.findMany({
      where: { productid: productId },
      select: { ProductOverviewDetailsId: true },
    });

    const currentDetailIds = currentDetails
      .map((detail) => detail.ProductOverviewDetailsId)
      .filter((id): id is number => id !== null); // Ensure non-null values

    // Extract IDs from selectedDetails
    const selectedDetailIds = selectedDetails
      .map((detail: { ProductOverviewDetailsId: number | null }) => detail.ProductOverviewDetailsId)
      .filter((id): id is number => id !== null); // Ensure non-null values

    // Determine new details to add
    const detailsToAdd = selectedDetailIds.filter((id) => !currentDetailIds.includes(id));

    // Determine details to remove
    const detailsToRemove = currentDetailIds.filter((id) => !selectedDetailIds.includes(id));

    // Perform database updates
    const addPromises = detailsToAdd.map((id) =>
      prisma.details_ProductOverviewDetails.create({
        data: {
          ProductName,
          ProductOverviewDetailsId: id,
          productid: productId,
        },
      })
    );

    const removePromises = detailsToRemove.map((id) =>
      prisma.details_ProductOverviewDetails.deleteMany({
        where: {
          ProductOverviewDetailsId: id,
          productid: productId,
        },
      })
    );

    await Promise.all([...addPromises, ...removePromises]);

    return NextResponse.json({
      message: "Product overview details updated successfully",
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
