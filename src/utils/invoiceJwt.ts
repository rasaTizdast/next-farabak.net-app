import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

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
export async function verifyInvoiceData(
  token: string
): Promise<InvoiceData | null> {
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(INVOICE_SECRET)
    );

    return payload as unknown as InvoiceData;
  } catch (error) {
    console.error("Error verifying invoice JWT:", error);
    return null;
  }
}

/**
 * Store invoice data in a cookie
 */
export function storeInvoiceCookie(token: string) {
  const cookieStore = cookies();

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 15 * 60, // 15 minutes in seconds
    path: "/",
  });
}

/**
 * Get invoice data from cookie
 */
export function getInvoiceCookie(): string | undefined {
  const cookieStore = cookies();
  return cookieStore.get(COOKIE_NAME)?.value;
}

/**
 * Delete invoice cookie
 */
export function deleteInvoiceCookie() {
  const cookieStore = cookies();
  cookieStore.delete(COOKIE_NAME);
}

/**
 * Client-side cookie functions (for use in the browser context)
 */
export function setClientInvoiceCookie(token: string) {
  document.cookie = `${COOKIE_NAME}=${token}; max-age=${15 * 60}; path=/; ${
    process.env.NODE_ENV === "production" ? "secure; " : ""
  }httpOnly`;
}

export function getClientInvoiceCookie(): string | null {
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === COOKIE_NAME) {
      return value;
    }
  }
  return null;
}
