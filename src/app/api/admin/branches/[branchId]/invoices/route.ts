import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * @swagger
 * /api/admin/branches/{branchId}/invoices:
 *   get:
 *     summary: Get all invoices for a specific branch
 *     parameters:
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Branch ID
 *     responses:
 *       200:
 *         description: List of branch invoices
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
export async function GET(request: Request, props: { params: Promise<{ branchId: string }> }) {
  const params = await props.params;
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  try {
    const branchId = parseInt(params.branchId);

    if (isNaN(branchId)) {
      return NextResponse.json({ error: "شناسه شعبه نامعتبر است" }, { status: 400 });
    }

    // Check if branch exists
    const branch = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT * FROM "support"."branch" WHERE "branchid" = ${branchId}
    `;

    if (!branch || branch.length === 0) {
      return NextResponse.json({ error: "شعبه مورد نظر یافت نشد" }, { status: 404 });
    }

    // Get branch's user ID
    const branchUserID = branch[0].UserID;

    // Get all invoices for this branch's user
    const invoices = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT 
        i."Invoiceid", i."FactorGuid", i."Fullname", i."Phonenumber",
        i."UserId", i."TotalAmount", i."Checked", i."Date"
      FROM 
        "info"."Invoice" i
      WHERE 
        i."UserId" = ${branchUserID}
      ORDER BY
        i."Invoiceid" DESC
    `;

    // Get details for each invoice
    const invoicesWithDetails = await Promise.all(
      invoices.map(async (invoice) => {
        const details = await prisma.$queryRaw<Record<string, unknown>[]>`
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
          details.map(async (detail) => {
            const warranty = await prisma.$queryRaw<Record<string, unknown>[]>`
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
              warranty: warranty.length > 0 ? warranty[0] : null,
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
    return NextResponse.json({ error: "خطا در بارگذاری فاکتورهای شعبه" }, { status: 500 });
  }
}
