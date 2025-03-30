import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromSession } from "@/lib/auth";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET;

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

/**
 * @swagger
 * /api/admin/branches/my/invoices:
 *   get:
 *     summary: Get all invoices for the current user's branch
 *     responses:
 *       200:
 *         description: List of branch invoices
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Branch not found for this user
 *       500:
 *         description: Server error
 */
export async function GET(request: Request) {
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

    // Get user from session
    const user = await getUserFromSession();

    if (!user) {
      return NextResponse.json({ error: "دسترسی غیرمجاز" }, { status: 401 });
    }

    // Check if user has a branch
    const branch = await prisma.$queryRaw`
      SELECT * FROM "support"."branch" WHERE "UserID" = ${userId}
    `;

    if (!branch || (branch as any[]).length === 0) {
      return NextResponse.json(
        { error: "شعبه‌ای برای کاربر جاری یافت نشد" },
        { status: 404 }
      );
    }

    // Get all invoices for this branch's user
    const invoices = await prisma.$queryRaw`
      SELECT 
        i."Invoiceid", i."FactorGuid", i."Fullname", i."Phonenumber",
        i."UserId", i."TotalAmount", i."Checked", i."Date"
      FROM 
        "info"."Invoice" i
      WHERE 
        i."UserId" = ${userId}
      ORDER BY
        i."Invoiceid" DESC
    `;

    // Get details for each invoice
    const invoicesWithDetails = await Promise.all(
      (invoices as any[]).map(async (invoice) => {
        const details = await prisma.$queryRaw`
          SELECT 
            id."Invoice_Details", id."ProductId", id."quantity", 
            id."price", id."total_price",
            p."Name", p."Type"
          FROM 
            "info"."Invoice_Details" id
          LEFT JOIN
            "support"."Product" p ON id."ProductId" = p."ProductId"
          WHERE 
            id."Invoiceid" = ${invoice.Invoiceid}
        `;

        // Get warranty info for each detail
        const detailsWithWarranty = await Promise.all(
          (details as any[]).map(async (detail) => {
            const warranty = await prisma.$queryRaw`
              SELECT 
                w."warrantyid", w."warrantycode", w."startdate", 
                w."expirydate", w."status"
              FROM 
                "info"."warranty" w
              WHERE 
                w."invoicedetailid" = ${detail.Invoice_Details}
            `;

            return {
              ...detail,
              warranty:
                (warranty as any[]).length > 0 ? (warranty as any[])[0] : null,
            };
          })
        );

        return {
          ...invoice,
          details: detailsWithWarranty,
        };
      })
    );

    return NextResponse.json(invoicesWithDetails);
  } catch (error) {
    console.error("Error fetching branch invoices:", error);
    return NextResponse.json(
      { error: "خطا در بارگذاری فاکتورهای شعبه" },
      { status: 500 }
    );
  }
}
