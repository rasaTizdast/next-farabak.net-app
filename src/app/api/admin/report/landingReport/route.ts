export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

export async function GET(): Promise<NextResponse> {
  try {
    // Get userRole from the HTTP-only cookie
    const auth = await requireAuth();
    if (auth instanceof NextResponse) return auth;

    if (auth.role !== "Admin") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch the total count of invoices
    const invoiceCount = await prisma.invoice.count();

    // Fetch the count of available and unavailable products
    const [availableCount, unavailableCount] = await Promise.all([
      prisma.product.count({ where: { Available: true } }),
      prisma.product.count({ where: { Available: false } }),
    ]);
    const productCount = {
      available: availableCount,
      unavailable: unavailableCount,
    };

    // Fetch the total amount of invoices based on Checked status
    const [checkedCount, uncheckedCount] = await Promise.all([
      prisma.invoice.count({ where: { Checked: true } }),
      prisma.invoice.count({
        where: {
          OR: [{ Checked: false }, { Checked: null }],
        },
      }),
    ]);
    const invoiceStatusCount = {
      checked: checkedCount,
      unchecked: uncheckedCount,
    };

    return NextResponse.json({
      invoiceCount,
      productCount,
      invoiceStatusCount,
    });
  } catch (error) {
    console.error(error);
    return new NextResponse("Failed to fetch landing report", { status: 500 });
  }
}
