import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../../../lib/db";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * @swagger
 * /api/admin/report/landingReport:
 *   get:
 *     summary: Retrieve landing report
 *     description: Fetches various counts and totals for invoices and products for the admin landing report. Requires an "Admin" role for access.
 *     tags:
 *       - Admin
 *     responses:
 *       200:
 *         description: Successfully retrieved the landing report.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 invoiceCount:
 *                   type: integer
 *                   description: Total number of invoices.
 *                 productCount:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: integer
 *                       description: Number of products with Available = true.
 *                     unavailable:
 *                       type: integer
 *                       description: Number of products with Available = false.
 *                 invoiceStatusCount:
 *                   type: object
 *                   properties:
 *                     checked:
 *                       type: number
 *                       description: Total amount of invoices with Checked = true.
 *                     unchecked:
 *                       type: number
 *                       description: Total amount of invoices with Checked = false.
 *       401:
 *         description: Unauthorized. The user is not logged in or does not have admin access.
 *       500:
 *         description: Internal server error.
 */

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function GET(): Promise<NextResponse> {
  try {
    // Get userRole from the HTTP-only cookie
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    const userRole = decoded.role;

    if (!userRole || userRole !== "Admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Connect to the database
    const pool = await connectToDatabase();

    // Fetch the total count of invoices
    const invoiceCountResult = await pool
      .request()
      .query("SELECT COUNT(*) AS InvoiceCount FROM Info.Factor");
    const invoiceCount = invoiceCountResult.recordset[0]?.InvoiceCount || 0;

    // Fetch the count of available and unavailable products
    const productCountResult = await pool.request().query(
      `SELECT 
          SUM(CASE WHEN Available = 1 THEN 1 ELSE 0 END) AS AvailableCount,
          SUM(CASE WHEN Available = 0 THEN 1 ELSE 0 END) AS UnavailableCount
         FROM Support.Product`
    );
    const productCount = {
      available: productCountResult.recordset[0]?.AvailableCount || 0,
      unavailable: productCountResult.recordset[0]?.UnavailableCount || 0,
    };

    // Fetch the total amount of invoices based on Checked status
    const invoiceStatusCountResult = await pool.request().query(
      `SELECT 
          COUNT(CASE WHEN Checked = 1 THEN 1 END) AS CheckedCount,
          COUNT(CASE WHEN Checked = 0 THEN 1 END) AS UncheckedCount
       FROM Info.Factor`
    );
    const invoiceStatusCount = {
      checked: invoiceStatusCountResult.recordset[0]?.CheckedCount || 0,
      unchecked: invoiceStatusCountResult.recordset[0]?.UncheckedCount || 0,
    };

    return NextResponse.json({
      invoiceCount,
      productCount,
      invoiceStatusCount,
    });
  } catch (error) {
    console.error("Error fetching landing report: ", error);
    return new NextResponse("Failed to fetch landing report", { status: 500 });
  }
}
