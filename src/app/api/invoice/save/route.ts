import { NextRequest, NextResponse } from "next/server";

import { signInvoiceData, InvoiceData } from "@/utils/invoiceJwt";

const COOKIE_NAME = "invoiceData";

/**
 * @swagger
 * /api/invoice/save:
 *   post:
 *     summary: Save invoice data securely in a cookie
 *     tags: [invoice]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ProductId:
 *                       type: number
 *                     ProductName:
 *                       type: string
 *                     Quantity:
 *                       type: number
 *                     Price:
 *                       type: number
 *                     Discount:
 *                       type: number
 *               TotalAmount:
 *                 type: number
 *     responses:
 *       200:
 *         description: Invoice data saved successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Extract invoice data from request
    const invoiceData = await request.json();

    // Validate input
    if (!invoiceData || !Array.isArray(invoiceData.products)) {
      return NextResponse.json({ message: "Invalid invoice data format" }, { status: 400 });
    }

    // Add timestamp for validation
    const dataWithTimestamp: InvoiceData = {
      ...invoiceData,
      timestamp: Date.now(),
    };

    // Sign the data
    const token = await signInvoiceData(dataWithTimestamp);

    // Create response with cookie
    const response = NextResponse.json({
      message: "Invoice data saved successfully",
      success: true,
    });

    // Set secure cookie with signed data
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 15 * 60, // 15 minutes in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Error saving invoice data:", error);
    return NextResponse.json(
      { message: "Failed to save invoice data", success: false },
      { status: 500 }
    );
  }
}
