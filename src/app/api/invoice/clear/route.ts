import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "invoiceData";

/**
 * @swagger
 * /api/invoice/clear:
 *   post:
 *     summary: Clear invoice data from the cookie
 *     tags: [invoice]
 *     responses:
 *       200:
 *         description: Invoice data cleared successfully
 *       500:
 *         description: Internal server error
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Create response with deleted cookie
    const response = NextResponse.json({
      message: "Invoice data cleared successfully",
      success: true,
    });

    // Delete the cookie
    response.cookies.delete(COOKIE_NAME);

    return response;
  } catch (error) {
    console.error("Error clearing invoice data:", error);
    return NextResponse.json(
      { message: "Failed to clear invoice data", success: false },
      { status: 500 }
    );
  }
}
