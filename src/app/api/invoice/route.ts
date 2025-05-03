import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import moment from "jalali-moment";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

/**
 * @swagger
 * /api/invoice:
 *   get:
 *     tags:
 *       - invoice
 *     summary: Get all invoices for the authenticated user
 *     description: Returns all invoices along with their details for the user based on the userId from the HTTP-only cookie.
 *     responses:
 *       200:
 *         description: List of invoices with details for the authenticated user
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
 *                   Products:
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
        { message: "توکن احراز هویت مورد نیاز است" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json({ message: "دسترسی غیرمجاز" }, { status: 401 });
    }

    // Fetch invoices and their details
    const invoices = await prisma.invoice.findMany({
      where: { UserId: userId },
      orderBy: { Date: "desc" },
      include: {
        Invoice_Details: true, // Include associated products
      },
    });

    // Sort Invoice_Details by ProductId for each invoice to group them
    const sortedInvoices = invoices.map((invoice) => ({
      ...invoice,
      Invoice_Details: invoice.Invoice_Details.sort((a, b) => {
        // First sort by ProductId to group same products together
        if (a.ProductId !== b.ProductId) {
          return (a.ProductId || 0) - (b.ProductId || 0);
        }
        // If same product, preserve original order
        return 0;
      }),
    }));

    return NextResponse.json(sortedInvoices, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { message: "خطا در دریافت فاکتورها" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/invoice:
 *   post:
 *     tags:
 *       - invoice
 *     summary: Create a new invoice
 *     description: Creates a new invoice in the database with unique FactorGuid and adds product details to the invoice.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Fullname:
 *                 type: string
 *               Phonenumber:
 *                 type: string
 *               TotalAmount:
 *                 type: number
 *               Products:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     ProductId:
 *                       type: string
 *                     Quantity:
 *                       type: number
 *                     Price:
 *                       type: number
 *     responses:
 *       201:
 *         description: Invoice successfully created
 *       400:
 *         description: Invalid request data
 *       500:
 *         description: Internal server error
 */
export async function POST(request: Request) {
  interface Product {
    ProductId: number; // Match your schema
    Quantity: number;
    Price: number;
    Discount: number;
  }

  try {
    const {
      Fullname,
      Phonenumber,
      TotalAmount,
      Products,
    }: {
      Fullname: string;
      Phonenumber: string;
      TotalAmount: number;
      Products: Product[];
    } = await request.json();

    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "توکن احراز هویت مورد نیاز است" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const userId = decoded.userId as number; // Convert to BigInt

    if (
      !Fullname ||
      !Phonenumber ||
      !TotalAmount ||
      !Products ||
      Products.length === 0
    ) {
      return NextResponse.json(
        { message: "اطلاعات درخواست نامعتبر است" },
        { status: 400 }
      );
    }

    const FactorGuid = `FARABAK-${uuidv4()}`;
    const currentDate = moment().locale("fa").format("YYYY-MM-DDTHH:mm:ss");

    // Create invoice first
    const createdInvoice = await prisma.invoice.create({
      data: {
        FactorGuid,
        Fullname,
        Phonenumber,
        TotalAmount,
        Date: currentDate,
        UserId: userId,
      },
    });

    const invoiceId = createdInvoice.Invoiceid;

    // Create individual invoice details for each product quantity
    const invoiceDetailsPromises: Promise<any>[] = [];

    for (const product of Products) {
      // Calculate the final price after discount once
      const finalPrice = product.Price - product.Discount;

      // For each product, create separate record for each quantity
      for (let i = 0; i < product.Quantity; i++) {
        const invoiceDetail = prisma.invoice_Details.create({
          data: {
            Invoiceid: invoiceId,
            ProductId: product.ProductId,
            quantity: 1, // Each record represents 1 item
            price: finalPrice, // Use final price (after discount) for price field
            total_price: finalPrice, // Use same final price for total_price field
            UserId: userId,
          },
        });

        invoiceDetailsPromises.push(invoiceDetail);
      }
    }

    // Execute all create operations
    const createdDetails = await Promise.all(invoiceDetailsPromises);

    return NextResponse.json(
      {
        message: "فاکتور با موفقیت ایجاد شد",
        invoice: createdInvoice,
        details: createdDetails,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "خطا در ایجاد فاکتور" },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/invoice:
 *   patch:
 *     tags:
 *       - invoice
 *     summary: Update invoice checked status
 *     description: Updates the checked status of an invoice identified by FactorGuid.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               FactorGuid:
 *                 type: string
 *     responses:
 *       200:
 *         description: Invoice checked status updated
 *       400:
 *         description: Invalid request data
 *       404:
 *         description: Invoice not found or unauthorized
 *       500:
 *         description: Internal server error
 */
export async function PATCH(request: Request) {
  try {
    const { FactorGuid } = await request.json();
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "توکن احراز هویت مورد نیاز است" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const userId = decoded.userId;

    if (!FactorGuid || !userId) {
      return NextResponse.json(
        { message: "اطلاعات درخواست نامعتبر است" },
        { status: 400 }
      );
    }

    // Check if the invoice exists and belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: { FactorGuid, UserId: userId },
    });

    if (!invoice) {
      return NextResponse.json(
        { message: "فاکتور یافت نشد یا دسترسی غیرمجاز است" },
        { status: 404 }
      );
    }

    // Update the checked status
    await prisma.invoice.update({
      where: { Invoiceid: invoice.Invoiceid },
      data: { Checked: true },
    });

    return NextResponse.json(
      { message: "وضعیت فاکتور با موفقیت بروزرسانی شد" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { message: "خطا در بروزرسانی فاکتور" },
      { status: 500 }
    );
  }
}
