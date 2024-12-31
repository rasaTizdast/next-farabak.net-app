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
        { message: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const userId = decoded.userId;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Fetch invoices and their details
    const invoices = await prisma.invoice.findMany({
      where: { UserId: userId },
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
        { message: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const userId = BigInt(decoded.userId as string); // Convert to BigInt

    if (
      !Fullname ||
      !Phonenumber ||
      !TotalAmount ||
      !Products ||
      Products.length === 0
    ) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    const FactorGuid = `FARABAK-${uuidv4()}`;
    const currentDate = moment().locale("fa").format("YYYY-MM-DDTHH:mm:ss");

    // Create invoice and details transactionally
    const createdInvoice = await prisma.invoice.create({
      data: {
        FactorGuid,
        Fullname,
        Phonenumber,
        TotalAmount,
        Date: currentDate,
        UserId: userId,
        Invoice_Details: {
          create: Products.map((product) => ({
            ProductId: product.ProductId,
            quantity: product.Quantity,
            price: product.Price,
            total_price: product.Quantity * product.Price,
            UserId: userId,
          })),
        },
      },
    });

    return NextResponse.json(createdInvoice, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice: ", error);
    return NextResponse.json(
      { message: "Failed to create invoice" },
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
        { message: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);
    const userId = decoded.userId;

    if (!FactorGuid || !userId) {
      return NextResponse.json(
        { message: "Invalid request data" },
        { status: 400 }
      );
    }

    // Check if the invoice exists and belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: { FactorGuid, UserId: userId },
    });

    if (!invoice) {
      return NextResponse.json(
        { message: "Invoice not found or unauthorized" },
        { status: 404 }
      );
    }

    // Update the checked status
    await prisma.invoice.update({
      where: { Invoiceid: invoice.Invoiceid },
      data: { Checked: true },
    });

    return NextResponse.json(
      { message: "Invoice checked status updated" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating invoice: ", error);
    return NextResponse.json(
      { message: "Failed to update invoice" },
      { status: 500 }
    );
  }
}
