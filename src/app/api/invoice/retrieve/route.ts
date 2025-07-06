import { NextRequest, NextResponse } from "next/server";
import { verifyInvoiceData } from "@/utils/invoiceJwt";

const COOKIE_NAME = "invoiceData";

/**
 * @swagger
 * /api/invoice/retrieve:
 *   get:
 *     summary: Retrieve invoice data from the cookie
 *     tags: [invoice]
 *     responses:
 *       200:
 *         description: Returns the invoice data if available
 *       404:
 *         description: No invoice data found
 *       400:
 *         description: Invalid or expired invoice data
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Get cookie from request
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { message: "No invoice data found", data: null },
        { status: 404 }
      );
    }

    // Verify and decode the JWT
    const invoiceData = await verifyInvoiceData(token);

    if (!invoiceData) {
      return NextResponse.json(
        { message: "Invalid or expired invoice data", data: null },
        { status: 400 }
      );
    }

    // Check if the data is still valid (within 15 minutes)
    const now = Date.now();
    const timestamp = invoiceData.timestamp || 0;
    const fifteenMinutesInMs = 15 * 60 * 1000;

    if (now - timestamp > fifteenMinutesInMs) {
      // Clear the cookie if expired
      const response = NextResponse.json(
        { message: "Invoice data has expired", data: null },
        { status: 400 }
      );
      response.cookies.delete(COOKIE_NAME);
      return response;
    }

    // Return the invoice data
    return NextResponse.json({
      message: "Invoice data retrieved successfully",
      data: invoiceData,
    });
  } catch (error) {
    console.error("Error retrieving invoice data:", error);
    return NextResponse.json(
      { message: "Error retrieving invoice data", data: null },
      { status: 500 }
    );
  }
}
