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
 * Generate a shorter unique GUID for invoices
 * Takes the first 12 characters of a UUID and checks if it already exists
 */
async function generateShortGuid(): Promise<string> {
  let isUnique = false;
  let shortGuid = "";

  while (!isUnique) {
    // Generate a full UUID and take only the first part before the first hyphen
    const fullUuid = uuidv4();
    shortGuid = fullUuid.split("-")[0].toUpperCase(); // Convert to uppercase

    // Check if this short GUID already exists in the database (case-insensitive)
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        FactorGuid: {
          contains: `FARABAK-${shortGuid}`,
          mode: "insensitive", // Case-insensitive check
        },
      },
    });

    isUnique = !existingInvoice;
  }

  return `FARABAK-${shortGuid}`;
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

    // Check for expired invoices (older than 48 hours) and delete them
    const now = moment();
    const validInvoices: typeof invoices = [];
    const deletedInvoiceIds: number[] = [];

    for (const invoice of invoices) {
      // Skip already checked invoices
      if (invoice.Checked) {
        validInvoices.push(invoice);
        continue;
      }

      // Parse the invoice date
      try {
        // Make sure invoice.Date exists before parsing
        if (!invoice.Date) {
          // If date is missing, consider invalid but keep it (fail safe)
          validInvoices.push(invoice);
          continue;
        }

        // Parse the date string, ensuring we handle Jalali date format correctly
        let invoiceDate;
        
        // If date includes 'T', it's in ISO format - parse directly as it's already in correct format
        if (invoice.Date.includes('T')) {
          const [datePart, timePart] = invoice.Date.split('T');
          const [year, month, day] = datePart.split('-').map(Number);
          const [hour, minute, second] = timePart ? timePart.split(':').map(Number) : [0, 0, 0];
          
          // Create a moment object with correct Jalali date components
          invoiceDate = moment();
          invoiceDate.jYear(year);
          invoiceDate.jMonth(month - 1); // 0-based month
          invoiceDate.jDate(day);
          invoiceDate.hour(hour);
          invoiceDate.minute(minute);
          invoiceDate.second(second || 0);
        } else {
          // Use default parsing for other formats, but be cautious
          invoiceDate = moment(invoice.Date);
        }
        
        // Calculate expiry (48 hours after creation)
        const expiryDate = invoiceDate.clone().add(48, 'hours');
        
        // Debug info to help troubleshoot
        console.log(`Invoice ${invoice.Invoiceid} - Created: ${invoiceDate.format('YYYY-MM-DD HH:mm:ss')}, Expires: ${expiryDate.format('YYYY-MM-DD HH:mm:ss')}, Now: ${now.format('YYYY-MM-DD HH:mm:ss')}, Expired: ${now.isAfter(expiryDate)}`);
        
        // Check if the invoice is expired (current time is AFTER expiry time)
        if (now.isAfter(expiryDate)) {
          // Invoice is expired, add to deletion list
          console.log(`Adding invoice ${invoice.Invoiceid} to delete list - expired`);
          deletedInvoiceIds.push(invoice.Invoiceid);
        } else {
          // Invoice is still valid
          console.log(`Keeping invoice ${invoice.Invoiceid} - still valid`);
          validInvoices.push(invoice);
        }
      } catch (error) {
        console.error(`Error parsing date for invoice ${invoice.Invoiceid}:`, error);
        // If date parsing fails, keep the invoice (fail safe)
        validInvoices.push(invoice);
      }
    }

    // Delete expired invoices if there are any
    if (deletedInvoiceIds.length > 0) {
      // First delete the related invoice details
      await prisma.invoice_Details.deleteMany({
        where: {
          Invoiceid: {
            in: deletedInvoiceIds
          }
        }
      });

      // Then delete the invoices
      await prisma.invoice.deleteMany({
        where: {
          Invoiceid: {
            in: deletedInvoiceIds
          }
        }
      });

      console.log(`Deleted ${deletedInvoiceIds.length} expired invoices for user ${userId}`);
    }

    // Sort Invoice_Details by ProductId for each invoice to group them
    const sortedInvoices = validInvoices.map((invoice) => ({
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

    // Generate shorter, unique GUID
    const FactorGuid = await generateShortGuid();
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
