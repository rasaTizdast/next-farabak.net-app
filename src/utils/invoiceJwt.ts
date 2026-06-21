import { SignJWT, jwtVerify } from "jose";

// Use the same secret as login or create a specific one for invoices
const INVOICE_SECRET = process.env.JWT_SECRET || "your_invoice_secret";
const COOKIE_NAME = "invoiceData";

// Interface for invoice data
export interface InvoiceData {
  products: Array<{
    ProductId: number;
    ProductName: string;
    Quantity: number;
    Price?: number;
    Discount?: number;
  }>;
  TotalAmount: number;
  timestamp: number; // Add timestamp for freshness verification
}

/**
 * Sign invoice data and return JWT token
 */
export async function signInvoiceData(data: InvoiceData): Promise<string> {
  return await new SignJWT(data as any)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("15m") // Same expiry as defined in requirements
    .sign(new TextEncoder().encode(INVOICE_SECRET));
}

/**
 * Verify and decode invoice data from JWT token
 */
export async function verifyInvoiceData(token: string): Promise<InvoiceData | null> {
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(INVOICE_SECRET));

    return payload as unknown as InvoiceData;
  } catch (error) {
    console.error("Error verifying invoice JWT:", error);
    return null;
  }
}
