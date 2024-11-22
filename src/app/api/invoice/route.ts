import { NextResponse } from "next/server";
import { connectToDatabase } from "../../../../lib/db";
import { v4 as uuidv4 } from "uuid";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import moment from "jalali-moment"; // Updated import

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

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
 *     description: Returns all invoices for the user based on the userId from the HTTP-only cookie.
 *     responses:
 *       200:
 *         description: List of invoices for the authenticated user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   FactorGuid:
 *                     type: string
 *                   Fullname:
 *                     type: string
 *                   Phonenumber:
 *                     type: string
 *                   TotalAmount:
 *                     type: number
 *                   ProductName:
 *                     type: string
 *                   Date:
 *                     type: string
 *                   UserId:
 *                     type: string
 *                   Quantity:
 *                     type: string
 *                   Checked:
 *                     type: boolean
 *       401:
 *         description: Unauthorized - No valid userId found in the cookie
 *       500:
 *         description: Internal server error
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Get userId from the HTTP-only cookie
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

    // Connect to the database
    const pool = await connectToDatabase();

    // Fetch user's invoices
    const result = await pool
      .request()
      .input("UserId", userId)
      .query(
        "SELECT * FROM Info.Factor WHERE UserId = @UserId ORDER BY Date DESC"
      );

    return NextResponse.json(result.recordset);
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
 *     description: Creates a new invoice in the database with unique FactorGuid and other fields.
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
 *               ProductName:
 *                 type: string
 *               Quantity:
 *                 type: string
 *               UserId:
 *                 type: string
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
    const {
      Fullname,
      Phonenumber,
      TotalAmount,
      ProductName,
      Quantity,
      UserId,
    } = await request.json();

    if (
      !Fullname ||
      !Phonenumber ||
      !TotalAmount ||
      !ProductName ||
      !Quantity ||
      !UserId
    ) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    // Generate unique FactorGuid
    const FactorGuid = `FARABAK-${uuidv4()}`;

    // Get the current date in Jalali format using jalali-moment
    const currentDate = moment().locale("fa").format("YYYY-MM-DDTHH:mm:ss");

    // Connect to the database
    const pool = await connectToDatabase();

    // Insert new invoice into the Info.Factor table
    await pool
      .request()
      .input("FactorGuid", FactorGuid)
      .input("Fullname", Fullname)
      .input("Phonenumber", Phonenumber)
      .input("TotalAmount", TotalAmount)
      .input("ProductName", ProductName)
      .input("Date", currentDate)
      .input("UserId", UserId)
      .input("Quantity", Quantity)
      .input("Checked", false).query(`
        INSERT INTO Info.Factor (FactorGuid, Fullname, Phonenumber, TotalAmount, ProductName, Date, UserId, Quantity, Checked)
        VALUES (@FactorGuid, @Fullname, @Phonenumber, @TotalAmount, @ProductName, @Date, @UserId, @Quantity, @Checked)
      `);

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

    // Get userId from the HTTP-only cookie
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { message: "Authorization token required" },
        { status: 401 }
      );
    }

    const decoded = await verifyToken(token);

    const UserId = decoded.userId;

    if (!FactorGuid || !UserId) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    // Connect to the database
    const pool = await connectToDatabase();

    // Check if the invoice exists
    const invoiceCheck = await pool
      .request()
      .input("FactorGuid", FactorGuid)
      .input("UserId", UserId)
      .query(
        "SELECT COUNT(*) AS count FROM Info.Factor WHERE FactorGuid = @FactorGuid AND UserId = @UserId"
      );

    if (invoiceCheck.recordset[0].count === 0) {
      return new NextResponse("Invoice not found or unauthorized", {
        status: 404,
      });
    }

    // Update the invoice checked status
    await pool
      .request()
      .input("FactorGuid", FactorGuid)
      .input("Checked", true)
      .query(
        "UPDATE Info.Factor SET Checked = @Checked WHERE FactorGuid = @FactorGuid"
      );

    return new NextResponse("Invoice checked status updated", { status: 200 });
  } catch (error) {
    console.error("Error updating invoice: ", error);
    return new NextResponse("Failed to update invoice", { status: 500 });
  }
}
