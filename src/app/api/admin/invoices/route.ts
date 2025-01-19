import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

/**
 * @swagger
 * /api/admin/invoices:
 *   get:
 *     tags:
 *       - Admin
 *     summary: Get all invoices with Admin access
 *     description: Returns all invoices along with their details with the admin role based on the userId from the HTTP-only cookie.
 *     responses:
 *       200:
 *         description: Lists all of the invoices with details
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   InvoiceId:
 *                     type: string
 *                   FactorGuid:
 *                     type: string
 *                   Fullname:
 *                     type: string
 *                   Phonenumber:
 *                     type: string
 *                   TotalAmount:
 *                     type: number
 *                   Date:
 *                     type: string
 *                   Checked:
 *                     type: boolean
 *                   Invoice_Details:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         ProductId:
 *                           type: string
 *                         Quantity:
 *                           type: number
 *                         Price:
 *                           type: number
 *                         TotalPrice:
 *                           type: number
 *       401:
 *         description: Unauthorized - No valid userId found in the cookie
 *       500:
 *         description: Internal server error
 */
export async function GET(): Promise<NextResponse> {
  try {
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
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch invoices and their details
    const invoices = await prisma.invoice.findMany({
      orderBy: { Date: "desc" },
      include: {
        Invoice_Details: true, // Include associated products
      },
    });

    return NextResponse.json(invoices, { status: 200 });
  } catch (error) {
    console.error("Error fetching invoices: ", error);
    return NextResponse.json(
      { message: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}
