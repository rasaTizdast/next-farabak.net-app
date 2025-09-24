import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/ProductOverviewDetails:
 *   post:
 *     summary: Create multiple overview details
 *     description: Accepts a list of overview details and creates records in the database.
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
 *                     ProductOverviewDetailsId:
 *                       type: integer
 *                       example: 101
 *                     ProductId:
 *                       type: integer
 *                       example: 1
 *                     ProductName:
 *                       type: string
 *                       example: "Example Product"
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
 *                   example: "Details created successfully!"
 *                 createdRecords:
 *                   type: integer
 *                   example: 4
 *       400:
 *         description: Invalid request payload
 *       500:
 *         description: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    // Log the incoming request body
    const body = await req.json();

    // Check if body is an array
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ message: "Invalid or missing payload" }, { status: 400 });
    }

    // Prepare data for database insertion
    const dataToInsert = body.map((detail) => ({
      ProductOverviewDetailsId: detail.ProductOverviewDetailsId,
      productid: detail.ProductId,
      ProductName: detail.ProductName,
    }));

    // Batch insert the payload into the database
    const createdRecords = await prisma.details_ProductOverviewDetails.createMany({
      data: dataToInsert,
      skipDuplicates: true, // Prevent duplicate inserts
    });

    return NextResponse.json({
      message: "Details created successfully!",
      createdRecords: createdRecords.count,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
