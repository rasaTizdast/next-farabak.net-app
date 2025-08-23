import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/specs:
 *   post:
 *     summary: Create multiple product specifications
 *     description: Accepts a list of specifications and creates records in the database.
 *     tags:
 *       - NewProduct
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               payload:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     Name:
 *                       type: string
 *                       example: "Battery Life"
 *                     Title:
 *                       type: string
 *                       example: "Battery Life"
 *                     Description:
 *                       type: string
 *                       example: "Up to 12 hours"
 *                     ProductId:
 *                       type: integer
 *                       example: 1
 *                     Available:
 *                       type: boolean
 *                       example: true
 *     responses:
 *       200:
 *         description: Records created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Specifications created successfully!"
 *                 createdRecords:
 *                   type: integer
 *                   example: 5
 *       400:
 *         description: Invalid request payload
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ message: "Invalid or missing payload" }, { status: 400 });
    }

    // Batch insert the payload into the database
    const createdRecords = await prisma.productSpecs.createMany({
      data: body.map((spec) => ({
        Name: spec.Name,
        Title: spec.Title,
        Description: spec.Description,
        ProductId: spec.ProductId,
        Available: spec.Available,
      })),
      skipDuplicates: true, // Prevent duplicate inserts
    });

    return NextResponse.json({
      message: "Specifications created successfully!",
      createdRecords: createdRecords.count,
    });
  } catch (error) {
    console.error("Error creating specs:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        error: String(error),
      },
      { status: 500 }
    );
  }
}
