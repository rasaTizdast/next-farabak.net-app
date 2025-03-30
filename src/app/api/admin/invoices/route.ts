import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET;

export const dynamic = "force-dynamic";

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

/**
 * @swagger
 * /api/admin/invoices:
 *   get:
 *     summary: Get all invoices
 *     responses:
 *       200:
 *         description: List of all invoices
 *       500:
 *         description: Server error
 */
export async function GET() {
  try {
    const invoices = await prisma.$queryRaw`
      SELECT 
        i."Invoiceid", i."FactorGuid", i."Fullname", i."Phonenumber",
        i."UserId", i."TotalAmount", i."Checked", i."Date"
      FROM 
        "info"."Invoice" i
      ORDER BY
        i."Invoiceid" DESC
    `;
    
    return NextResponse.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json(
      { error: 'خطا در بارگذاری فاکتورها' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/admin/invoices:
 *   post:
 *     summary: Create a new invoice with details and warranties
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - branchId
 *               - invoiceData
 *             properties:
 *               branchId:
 *                 type: integer
 *                 description: ID of the branch creating the invoice
 *               invoiceData:
 *                 type: object
 *                 description: Invoice data with products and warranties
 *     responses:
 *       201:
 *         description: Invoice created successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { branchId, invoiceData } = body;
    
    if (!branchId || !invoiceData) {
      return NextResponse.json(
        { error: 'اطلاعات ارسالی ناقص است' },
        { status: 400 }
      );
    }
    
    // Generate unique invoice GUID
    const factorGuid = uuidv4();
    
    // Create invoice in the database
    const newInvoice = await prisma.$queryRaw`
      INSERT INTO "info"."Invoice" (
        "FactorGuid", "Fullname", "Phonenumber", "UserId", 
        "TotalAmount", "Checked", "Date"
      )
      VALUES (
        ${factorGuid}, 
        ${invoiceData.Fullname}, 
        ${invoiceData.Phonenumber}, 
        ${invoiceData.UserId},
        ${invoiceData.TotalAmount}, 
        ${!!invoiceData.Checked}, 
        ${invoiceData.Date || new Date().toISOString()}
      )
      RETURNING *
    `;
    
    const createdInvoice = (newInvoice as any[])[0];
    const invoiceId = createdInvoice.Invoiceid;
    
    // Create invoice details and warranties
    for (const product of invoiceData.products) {
      // Create invoice detail
      const invoiceDetail = await prisma.$queryRaw`
        INSERT INTO "info"."Invoice_Details" (
          "Invoiceid", "UserId", "ProductId", "quantity", "price", "total_price"
        )
        VALUES (
          ${invoiceId}, 
          ${invoiceData.UserId}, 
          ${product.ProductId}, 
          ${product.quantity}, 
          ${product.price}, 
          ${product.total_price}
        )
        RETURNING *
      `;
      
      const createdDetail = (invoiceDetail as any[])[0];
      
      // If product has warranty, create it
      if (product.warranty && product.warranty.hasWarranty) {
        await prisma.$queryRaw`
          INSERT INTO "info"."warranty" (
            "userid", "invoicedetailid", "branchid", "warrantycode", 
            "ProductId", "startdate", "expirydate", "status"
          )
          VALUES (
            ${invoiceData.UserId}, 
            ${createdDetail.Invoice_Details}, 
            ${branchId}, 
            ${product.warranty.warrantycode}, 
            ${product.ProductId}, 
            ${product.warranty.startdate}, 
            ${product.warranty.expirydate}, 
            'Active'
          )
        `;
      }
      
      // Update branch product quantity
      await prisma.$queryRaw`
        UPDATE "support"."branchproduct"
        SET "quantity" = "quantity" - ${product.quantity}
        WHERE "branchid" = ${branchId} AND "ProductId" = ${product.ProductId}
      `;
    }
    
    return NextResponse.json(
      { 
        message: 'فاکتور با موفقیت ثبت شد',
        invoice: createdInvoice 
      }, 
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json(
      { error: 'خطا در ثبت فاکتور' },
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
 *       - Admin
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
 *       - Admin
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
    return NextResponse.json(
      { message: "Failed to delete invoice" },
      { status: 500 }
    );
  }
}
