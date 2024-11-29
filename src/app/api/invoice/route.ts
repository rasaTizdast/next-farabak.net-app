import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
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
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const pool = await connectToDatabase();

    // Fetch invoices for the user
    const invoices = await pool
      .request()
      .input("UserId", userId)
      .query(
        `SELECT Invoiceid, FactorGuid, Fullname, Phonenumber, TotalAmount, Date, Checked 
         FROM Info.Invoice WHERE UserId = @UserId ORDER BY Date DESC`
      );

    const invoiceDetails = await pool
      .request()
      .input("UserId", userId)
      .query(
        `SELECT Invoiceid, ProductId, Quantity, Price, Total_Price 
         FROM Info.Invoice_Details WHERE UserId = @UserId`
      );

    const invoicesWithDetails = invoices.recordset.map((invoice) => ({
      ...invoice,
      Products: invoiceDetails.recordset.filter(
        (detail) => detail.Invoiceid === invoice.Invoiceid
      ),
    }));

    return NextResponse.json(invoicesWithDetails);
  } catch (error) {
    console.error("Error fetching invoices: ", error);
    return new NextResponse("Failed to fetch invoices", { status: 500 });
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
  try {
    const { Fullname, Phonenumber, TotalAmount, Products } =
      await request.json();
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

    if (
      !Fullname ||
      !Phonenumber ||
      !TotalAmount ||
      !Products ||
      Products.length === 0
    ) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    const FactorGuid = `FARABAK-${uuidv4()}`;
    const currentDate = moment().locale("fa").format("YYYY-MM-DDTHH:mm:ss");

    const pool = await connectToDatabase();

    // Insert invoice
    const invoiceResult = await pool
      .request()
      .input("FactorGuid", FactorGuid)
      .input("Fullname", Fullname)
      .input("Phonenumber", Phonenumber)
      .input("TotalAmount", TotalAmount)
      .input("Date", currentDate)
      .input("UserId", userId)
      .query(
        `INSERT INTO Info.Invoice (FactorGuid, Fullname, Phonenumber, TotalAmount, Date, UserId)
         OUTPUT Inserted.Invoiceid
         VALUES (@FactorGuid, @Fullname, @Phonenumber, @TotalAmount, @Date, @UserId)`
      );

    const invoiceId = invoiceResult.recordset[0].Invoiceid;

    // Insert product details
    for (const product of Products) {
      await pool
        .request()
        .input("Invoiceid", invoiceId)
        .input("UserId", userId)
        .input("ProductId", product.ProductId)
        .input("Quantity", product.Quantity)
        .input("Price", product.Price)
        .input("Total_Price", product.Quantity * product.Price)
        .query(
          `INSERT INTO Info.Invoice_Details (Invoiceid, UserId, ProductId, Quantity, Price, Total_Price)
           VALUES (@Invoiceid, @UserId, @ProductId, @Quantity, @Price, @Total_Price)`
        );
    }

    return new NextResponse("Invoice created successfully", { status: 201 });
  } catch (error) {
    console.error("Error creating invoice: ", error);
    return new NextResponse("Failed to create invoice", { status: 500 });
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
      return new NextResponse("Invalid request data", { status: 400 });
    }

    const pool = await connectToDatabase();

    const invoiceCheck = await pool
      .request()
      .input("FactorGuid", FactorGuid)
      .input("UserId", userId)
      .query(
        `SELECT COUNT(*) AS count FROM Info.Invoice WHERE FactorGuid = @FactorGuid AND UserId = @UserId`
      );

    if (invoiceCheck.recordset[0].count === 0) {
      return new NextResponse("Invoice not found or unauthorized", {
        status: 404,
      });
    }

    await pool
      .request()
      .input("FactorGuid", FactorGuid)
      .query(
        `UPDATE Info.Invoice SET Checked = 1 WHERE FactorGuid = @FactorGuid`
      );

    return new NextResponse("Invoice checked status updated", { status: 200 });
  } catch (error) {
    console.error("Error updating invoice: ", error);
    return new NextResponse("Failed to update invoice", { status: 500 });
  }
}
