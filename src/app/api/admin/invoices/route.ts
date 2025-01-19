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
 *     summary: Retrieve all invoices and their details
 *     tags:
 *      -Admin
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved invoices.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Invoice'
 *       401:
 *         description: Unauthorized or missing token.
 *       500:
 *         description: Server error.
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

    const invoices = await prisma.invoice.findMany({
      orderBy: { Date: "desc" },
      include: { Invoice_Details: true },
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

/**
 * @swagger
 * /api/admin/invoices:
 *   patch:
 *     summary: Update the checked status of an invoice.
 *     tags:
 *      -Admin
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               invoiceId:
 *                 type: integer
 *               checked:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Successfully updated the invoice.
 *       401:
 *         description: Unauthorized or missing token.
 *       500:
 *         description: Server error.
 */
export async function PATCH(req: Request): Promise<NextResponse> {
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

    const { Invoiceid, checked } = await req.json();
    console.log("Received Payload:", { Invoiceid, checked });

    if (typeof checked !== "boolean") {
      return NextResponse.json(
        { message: "Invalid data: 'checked' must be a boolean" },
        { status: 400 }
      );
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { Invoiceid: Invoiceid },
      data: { Checked: checked },
    });

    return NextResponse.json(updatedInvoice, { status: 200 });
  } catch (error) {
    console.error("Error updating invoice: ", error);
    return NextResponse.json(
      { message: "Failed to update invoice" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/invoices:
 *   delete:
 *     summary: Delete an invoice and its details.
 *     tags:
 *      -Admin
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: invoiceId
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully deleted the invoice.
 *       401:
 *         description: Unauthorized or missing token.
 *       500:
 *         description: Server error.
 */
export async function DELETE(req: Request): Promise<NextResponse> {
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

    const { searchParams } = new URL(req.url);
    const invoiceId = searchParams.get("invoiceId");

    if (!invoiceId) {
      return NextResponse.json(
        { message: "Invoice ID is required" },
        { status: 400 }
      );
    }

    // Delete Invoice and associated details
    await prisma.invoice_Details.deleteMany({
      where: { Invoiceid: +invoiceId },
    });
    await prisma.invoice.delete({ where: { Invoiceid: +invoiceId } });

    return NextResponse.json(
      { message: "Invoice and its details successfully deleted" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting invoice: ", error);
    return NextResponse.json(
      { message: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
