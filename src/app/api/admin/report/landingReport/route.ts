export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
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

    // Fetch the total count of invoices
    const invoiceCount = await prisma.invoice.count();

    // Fetch the count of available and unavailable products
    const productCount = {
      available: await prisma.product.count({ where: { Available: true } }),
      unavailable: await prisma.product.count({ where: { Available: false } }),
    };

    // Fetch the total amount of invoices based on Checked status
    const invoiceStatusCount = {
      checked: await prisma.invoice.count({ where: { Checked: true } }),
      unchecked: await prisma.invoice.count({ where: { Checked: false } }),
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
