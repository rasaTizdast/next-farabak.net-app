import { NextResponse } from "next/server";
import { z } from "zod";

import { notFoundResponse, serverErrorResponse, unauthorizedResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateParams } from "@/lib/validation";

export const dynamic = "force-dynamic";

const invoicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

interface WarrantyRaw {
  warrantyid: number;
  invoicedetailid: number;
  warrantycode: string;
  branchid: number | string;
  startdate: Date | string;
  expirydate: Date | string;
  status: string;
  ProductId: number;
  userid?: number;
  Name?: string | null;
  Type?: string | null;
  quantity?: number | null;
  price?: number | null;
  ClientFirstName?: string | null;
  ClientLastName?: string | null;
  ClientPhoneNumber?: string | null;
  [key: string]: unknown;
}

interface InvoiceDetailRaw {
  Invoice_Details: number;
  ProductId: number;
  quantity: number;
  price: number;
  total_price: number;
  Name?: string | null;
  Type?: string | null;
  [key: string]: unknown;
}

/**
 * @swagger
 * /api/admin/branches/my/invoices:
 *   get:
 *     summary: Get invoices created by the current branch
 *     description: Retrieves all invoices and warranties that were created by the authenticated branch
 *     tags:
 *       - Branch
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of branch invoices with their details and warranties
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Branch not found
 *       500:
 *         description: Server error
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryResult = validateParams(Object.fromEntries(url.searchParams), invoicesQuerySchema);
  if ("error" in queryResult) return queryResult.error;
  const data = queryResult.data;

  const page = data.page;
  const limit = data.limit;
  const offset = (page - 1) * limit;

  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;

  const userId = auth.userId;
  const userRole = auth.role;

  if (userRole !== "Branch") {
    return unauthorizedResponse(
      "دسترسی غیرمجاز: فقط کاربران شعبه می‌توانند به این بخش دسترسی داشته باشند"
    );
  }

  try {
    // Find the branch associated with this user
    const branchResult = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT "branchid", "name", "location"
      FROM "support"."branch"
      WHERE "UserID" = ${Number(userId)}
    `;

    if (!branchResult || branchResult.length === 0) {
      return notFoundResponse("شعبه‌ای برای این کاربر یافت نشد");
    }

    const branch = branchResult[0];
    const branchId = branch.branchid;

    // Count total invoices for pagination
    const countResult = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT COUNT(DISTINCT i."Invoiceid") as total
      FROM 
        "info"."Invoice" i
      WHERE 
        i."UserId" = ${Number(userId)}
    `;

    const totalCount = Number(countResult[0].total);

    // Find all invoices created by this branch with pagination
    const invoices = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT DISTINCT
        i."Invoiceid", i."FactorGuid", i."Fullname", i."Phonenumber",
        i."UserId", i."TotalAmount", i."Checked", i."Date"
      FROM 
        "info"."Invoice" i
      WHERE 
        i."UserId" = ${Number(userId)}
      ORDER BY
        i."Date" DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    // For each invoice, get its details and warranties
    const invoicesWithDetails = await Promise.all(
      invoices.map(async (invoice) => {
        // Get invoice details and warranties in parallel
        const [details, warranties] = await Promise.all([
          prisma.$queryRaw<Record<string, unknown>[]>`
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
          `,
          prisma.$queryRaw<Record<string, unknown>[]>`
            SELECT
              w."warrantyid", w."invoicedetailid", w."warrantycode",
              w."startdate", w."expirydate", w."status", w."ProductId", w."branchid"
            FROM
              "info"."warranty" w
            JOIN
              "info"."Invoice_Details" id ON w."invoicedetailid" = id."Invoice_Details"
            WHERE
              id."Invoiceid" = ${invoice.Invoiceid}
              AND w."branchid" = ${branchId}
          `,
        ]);

        // Process warranty status
        const processedWarranties = (warranties as WarrantyRaw[]).map((warranty) => {
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

        // Map warranty data to invoice details
        const detailsWithWarranty = (details as InvoiceDetailRaw[]).map((detail) => {
          const warranty = processedWarranties.find(
            (w) => w.invoicedetailid === detail.Invoice_Details
          );

          return {
            ...detail,
            warranty: warranty || null,
          };
        });

        // Sort details by ProductId to group same products together
        const sortedDetails = detailsWithWarranty.toSorted((a, b) => {
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

    // Get standalone warranties (warranties associated with the branch but not attached to any invoices in the current pagination set)
    const invoiceIds = invoices.map((invoice) => invoice.Invoiceid);

    // Get all invoice detail IDs for these invoices
    let detailIds: number[] = [];

    if (invoiceIds.length > 0) {
      // Create a dynamic query for the IN clause
      const placeholders = invoiceIds.map((_, i) => `$${i + 1}`).join(", ");

      const query = `
        SELECT "Invoice_Details"
        FROM "info"."Invoice_Details" 
        WHERE "Invoiceid" IN (${placeholders})
      `;

      const invoiceDetailsIds = await prisma.$queryRawUnsafe(query, ...invoiceIds);

      detailIds = (invoiceDetailsIds as Array<{ Invoice_Details: number }>).map(
        (detail) => detail.Invoice_Details
      );
    }

    // Now get all standalone warranties for this branch that are not in the current set of invoice details
    let standaloneWarranties: WarrantyRaw[] = [];

    if (detailIds.length > 0) {
      // Create a dynamic query for the NOT IN clause
      const placeholders = detailIds.map((_, i) => `$${i + 2}`).join(", "); // +2 because $1 is reserved for branchId

      const query = `
        SELECT 
          w."warrantyid", w."invoicedetailid", w."warrantycode", 
          w."startdate", w."expirydate", w."status", w."ProductId", w."branchid", w."userid",
          p."Name", p."Type",
          id."quantity", id."price",
          c."FirstName" as "ClientFirstName", c."LastName" as "ClientLastName", c."PhoneNumber" as "ClientPhoneNumber"
        FROM 
          "info"."warranty" w
        LEFT JOIN
          "support"."Product" p ON w."ProductId" = p."ProductId"
        LEFT JOIN
          "info"."Invoice_Details" id ON w."invoicedetailid" = id."Invoice_Details"
        LEFT JOIN
          "info"."Client" c ON w."userid" = c."UserID"  
        WHERE 
          w."branchid" = $1
          AND w."invoicedetailid" NOT IN (${placeholders})
      `;

      standaloneWarranties = await prisma.$queryRawUnsafe<WarrantyRaw[]>(
        query,
        branchId,
        ...detailIds
      );
    } else {
      standaloneWarranties = await prisma.$queryRaw<WarrantyRaw[]>`
        SELECT 
          w."warrantyid", w."invoicedetailid", w."warrantycode", 
          w."startdate", w."expirydate", w."status", w."ProductId", w."branchid", w."userid",
          p."Name", p."Type",
          id."quantity", id."price",
          c."FirstName" as "ClientFirstName", c."LastName" as "ClientLastName", c."PhoneNumber" as "ClientPhoneNumber"
        FROM 
          "info"."warranty" w
        LEFT JOIN
          "support"."Product" p ON w."ProductId" = p."ProductId"
        LEFT JOIN
          "info"."Invoice_Details" id ON w."invoicedetailid" = id."Invoice_Details"
        LEFT JOIN
          "info"."Client" c ON w."userid" = c."UserID"
        WHERE 
          w."branchid" = ${branchId}
      `;
    }

    // Process standalone warranty status
    const processedStandaloneWarranties = standaloneWarranties.map((warranty) => {
      const today = new Date();
      const expiryDate = new Date(warranty.expirydate);

      // Add a display status without modifying the database
      let displayStatus = warranty.status;
      if (today > expiryDate) {
        displayStatus = "Expired";
      } else {
        displayStatus = "Active";
      }

      // Create a full name from first name and last name
      const clientFullName =
        warranty.ClientFirstName && warranty.ClientLastName
          ? `${warranty.ClientFirstName} ${warranty.ClientLastName}`
          : "نامشخص";

      return {
        ...warranty,
        displayStatus,
        clientFullName,
      };
    });

    // Calculate summary of active and expired warranties (for all invoices, not just paginated ones)
    // Get all warranties for this branch
    const allWarranties = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT 
        w."warrantyid", w."startdate", w."expirydate", w."status", w."branchid"
      FROM 
        "info"."warranty" w
      WHERE 
        w."branchid" = ${branchId}
    `;

    let active = 0;
    let expired = 0;

    (allWarranties as WarrantyRaw[]).forEach((warranty) => {
      const today = new Date();
      const expiryDate = new Date(warranty.expirydate);

      if (today > expiryDate) {
        expired++;
      } else {
        active++;
      }
    });

    // Calculate pagination details
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      branch,
      invoices: invoicesWithDetails,
      standaloneWarranties: processedStandaloneWarranties,
      warrantySummary: { active, expired },
      pagination: {
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching branch invoices:", error);
    return serverErrorResponse("خطای داخلی سرور");
  }
}
