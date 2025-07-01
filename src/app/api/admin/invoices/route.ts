import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { v4 as uuidv4 } from "uuid";
import moment from "jalali-moment";

const JWT_SECRET = process.env.JWT_SECRET;

export const dynamic = "force-dynamic";

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

/**
 * Generate a shorter unique GUID for invoices
 * Takes the first part of a UUID and checks if it already exists
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
    // First, fetch all invoices with basic information
    let invoices = await prisma.$queryRaw`
      SELECT 
        i."Invoiceid", i."FactorGuid", i."Fullname", i."Phonenumber",
        i."UserId", i."TotalAmount", i."Checked", i."Date"
      FROM 
        "info"."Invoice" i
      ORDER BY
        i."Invoiceid" DESC
    `;

    // Check for expired invoices (older than 48 hours) and delete them if not checked
    const now = moment();
    const validInvoices: any[] = [];
    const deletedInvoiceIds: number[] = [];

    for (const invoice of invoices as any[]) {
      // Skip already checked invoices
      if (invoice.Checked) {
        validInvoices.push(invoice);
        continue;
      }

      // Parse the invoice date
      try {
        // Make sure invoice.Date exists before parsing
        if (!invoice.Date) {
          // If date is missing, consider valid but keep it (fail safe)
          validInvoices.push(invoice);
          continue;
        }

        // Parse the date string, ensuring we handle Jalali date format correctly
        let invoiceDate;

        // If date includes 'T', it's in ISO format
        if (invoice.Date.includes("T")) {
          const [datePart, timePart] = invoice.Date.split("T");
          const [year, month, day] = datePart.split("-").map(Number);
          const [hour, minute, second] = timePart
            ? timePart.split(":").map(Number)
            : [0, 0, 0];

          // Create a moment object with correct Jalali date components
          invoiceDate = moment();
          invoiceDate.jYear(year);
          invoiceDate.jMonth(month - 1); // 0-based month
          invoiceDate.jDate(day);
          invoiceDate.hour(hour);
          invoiceDate.minute(minute);
          invoiceDate.second(second || 0);
        } else {
          // Use default parsing for other formats
          invoiceDate = moment(invoice.Date);
        }

        // Calculate expiry (48 hours after creation)
        const expiryDate = invoiceDate.clone().add(48, "hours");

        // Check if the invoice is expired (current time is AFTER expiry time)
        if (now.isAfter(expiryDate)) {
          deletedInvoiceIds.push(invoice.Invoiceid);
        } else {
          validInvoices.push(invoice);
        }
      } catch (error) {
        validInvoices.push(invoice);
      }
    }

    // Delete expired invoices if there are any
    if (deletedInvoiceIds.length > 0) {
      // First delete the related invoice details
      await prisma.invoice_Details.deleteMany({
        where: {
          Invoiceid: {
            in: deletedInvoiceIds,
          },
        },
      });

      // Then delete the invoices
      await prisma.invoice.deleteMany({
        where: {
          Invoiceid: {
            in: deletedInvoiceIds,
          },
        },
      });

      // Update invoices list to only include valid ones
      invoices = validInvoices;
    }

    // For each invoice, get its details and warranties
    const invoicesWithDetails = await Promise.all(
      (invoices as any[]).map(async (invoice) => {
        // Get invoice details
        const details = await prisma.$queryRaw`
          SELECT 
            id."Invoice_Details", id."ProductId", id."quantity", 
            id."price", id."total_price"
          FROM 
            "info"."Invoice_Details" id
          WHERE 
            id."Invoiceid" = ${invoice.Invoiceid}
        `;

        // Get warranties for this invoice's products
        const warranties = await prisma.$queryRaw`
          SELECT 
            w."warrantyid", w."invoicedetailid", w."warrantycode", 
            w."startdate", w."expirydate", w."status", w."ProductId", w."branchid"
          FROM 
            "info"."warranty" w
          JOIN 
            "info"."Invoice_Details" id ON w."invoicedetailid" = id."Invoice_Details"
          WHERE 
            id."Invoiceid" = ${invoice.Invoiceid}
        `;

        // Process warranty status
        const processedWarranties = (warranties as any[]).map((warranty) => {
          const today = new Date();
          const expiryDate = new Date(warranty.expirydate);

          // Add a display status without modifying the database
          let displayStatus = warranty.status;
          if (today > expiryDate) {
            displayStatus = "Expired";
          } else {
            displayStatus = "Active";
          }

          return {
            ...warranty,
            displayStatus,
          };
        });

        // Group warranties by invoice detail and product
        const warrantiesByDetail = processedWarranties.reduce(
          (acc, warranty) => {
            const key = warranty.invoicedetailid;
            if (!acc[key]) {
              acc[key] = {
                ...warranty,
                warrantycodes: [
                  {
                    code: warranty.warrantycode,
                    startdate: warranty.startdate,
                    expirydate: warranty.expirydate,
                    status: warranty.status,
                    branchid: warranty.branchid,
                  },
                ],
              };
            } else {
              // Add this warranty code to the existing entry
              acc[key].warrantycodes.push({
                code: warranty.warrantycode,
                startdate: warranty.startdate,
                expirydate: warranty.expirydate,
                status: warranty.status,
                branchid: warranty.branchid,
              });
            }
            return acc;
          },
          {}
        );

        // Map warranty data to invoice details
        const detailsWithWarranty = (details as any[]).map((detail) => {
          const warranty = warrantiesByDetail[detail.Invoice_Details];

          return {
            ...detail,
            warranty: warranty || null,
          };
        });

        // Sort details by ProductId to group same products together
        const sortedDetails = [...detailsWithWarranty].sort((a, b) => {
          // First sort by ProductId to group same products together
          if (a.ProductId !== b.ProductId) {
            return (a.ProductId || 0) - (b.ProductId || 0);
          }
          // If same product, preserve original order
          return 0;
        });

        return {
          ...invoice,
          Invoice_Details: sortedDetails,
        };
      })
    );

    return NextResponse.json(invoicesWithDetails);
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "خطا در بارگذاری فاکتورها" },
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
    const { branchId, invoiceData } = await request.json();

    // Validation
    if (
      !branchId ||
      !invoiceData ||
      !invoiceData.Fullname ||
      !invoiceData.Phonenumber
    ) {
      return NextResponse.json(
        { error: "Invalid request data" },
        { status: 400 }
      );
    }

    // Generate shorter, unique GUID
    const factorGuid = await generateShortGuid();

    // Create the invoice with Checked: true for branch users
    const createdInvoice = await prisma.invoice.create({
      data: {
        FactorGuid: factorGuid,
        Fullname: invoiceData.Fullname,
        Phonenumber: invoiceData.Phonenumber,
        TotalAmount: invoiceData.TotalAmount,
        Date: invoiceData.Date,
        UserId: invoiceData.UserId,
        Checked: true, // Always set to true for branch-created invoices
      },
    });

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
        message: "فاکتور با موفقیت ثبت شد",
        invoice: createdInvoice,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json({ error: "خطا در ثبت فاکتور" }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/admin/invoices:
 *   patch:
 *     summary: Update the checked status of an invoice.
 *     tags:
 *       - Admin
 *       - Branch
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               checked:
 *                 type: boolean
 *     parameters:
 *       - name: id
 *         in: query
 *         required: true
 *         schema:
 *           type: integer
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

    // Allow both Admin and Branch users to update invoice status
    if (!userRole || (userRole !== "Admin" && userRole !== "Branch")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Get invoice ID from query parameters
    const { searchParams } = new URL(req.url);
    const queryInvoiceId = searchParams.get("id");

    // Get request body
    const body = await req.json();

    // Check for invoiceId in both query params and request body
    const invoiceId = queryInvoiceId || body.Invoiceid?.toString();

    if (!invoiceId) {
      return NextResponse.json(
        {
          message:
            "Invoice ID is required in either query params ('id') or request body ('Invoiceid')",
        },
        { status: 400 }
      );
    }

    const checked = body.checked;

    if (typeof checked !== "boolean") {
      return NextResponse.json(
        { message: "Invalid data: 'checked' must be a boolean" },
        { status: 400 }
      );
    }

    // For branch users, check if they're allowed to update this invoice
    if (userRole === "Branch") {
      // Get branch ID for the user
      const userId = decoded.userId || decoded.id || decoded.sub;
      const branch = await prisma.$queryRaw`
        SELECT "branchid" FROM "support"."branch"
        WHERE "UserID" = ${Number(userId)}
      `;

      if (!branch || (branch as any[]).length === 0) {
        return NextResponse.json(
          { message: "No branch found for this user" },
          { status: 403 }
        );
      }

      // Check if the invoice is associated with this branch through warranties
      const branchInvoices = await prisma.$queryRaw`
        SELECT DISTINCT i."Invoiceid"
        FROM "info"."Invoice" i
        JOIN "info"."Invoice_Details" id ON i."Invoiceid" = id."Invoiceid"
        JOIN "info"."warranty" w ON id."Invoice_Details" = w."invoicedetailid"
        WHERE i."Invoiceid" = ${parseInt(invoiceId)}
        AND w."branchid" = ${(branch as any[])[0].branchid}
      `;

      if (!branchInvoices || (branchInvoices as any[]).length === 0) {
        return NextResponse.json(
          { message: "You are not authorized to update this invoice" },
          { status: 403 }
        );
      }
    }

    // Update the invoice
    const updatedInvoice = await prisma.invoice.update({
      where: { Invoiceid: parseInt(invoiceId) },
      data: { Checked: checked },
    });

    return NextResponse.json(updatedInvoice, { status: 200 });
  } catch (error) {
    console.error("Error updating invoice:", error);
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
