import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export const dynamic = "force-dynamic";

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
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Get the access token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
      return NextResponse.json(
        { error: "توکن احراز هویت مورد نیاز است" },
        { status: 401 }
      );
    }

    // Verify and decode the token
    const decoded = await verifyToken(token);
    const userId = decoded.userId;
    const userRole = decoded.role;

    if (!userId || userRole !== "Branch") {
      return NextResponse.json(
        {
          error:
            "دسترسی غیرمجاز: فقط کاربران شعبه می‌توانند به این بخش دسترسی داشته باشند",
        },
        { status: 401 }
      );
    }

    // Find the branch associated with this user
    const branchResult = await prisma.$queryRaw`
      SELECT "branchid", "name", "location"
      FROM "support"."branch"
      WHERE "UserID" = ${Number(userId)}
    `;

    if (!branchResult || (branchResult as any[]).length === 0) {
      return NextResponse.json(
        { error: "شعبه‌ای برای این کاربر یافت نشد" },
        { status: 404 }
      );
    }

    const branch = (branchResult as any[])[0];
    const branchId = branch.branchid;

    // Count total invoices for pagination
    const countResult = await prisma.$queryRaw`
      SELECT COUNT(DISTINCT i."Invoiceid") as total
      FROM 
        "info"."Invoice" i
      WHERE 
        i."UserId" = ${Number(userId)}
    `;

    const totalCount = Number((countResult as any[])[0].total);

    // Find all invoices created by this branch with pagination
    const invoices = await prisma.$queryRaw`
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
      (invoices as any[]).map(async (invoice) => {
        // Get invoice details
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
            AND w."branchid" = ${branchId}
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

        // Map warranty data to invoice details
        const detailsWithWarranty = (details as any[]).map((detail) => {
          const warranty = processedWarranties.find(
            (w) => w.invoicedetailid === detail.Invoice_Details
          );

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

    // Get standalone warranties (warranties associated with the branch but not attached to any invoices in the current pagination set)
    const invoiceIds = (invoices as any[]).map((invoice) => invoice.Invoiceid);

    // Get all invoice detail IDs for these invoices
    let detailIds: any[] = [];

    if (invoiceIds.length > 0) {
      // Create a dynamic query for the IN clause
      let placeholders = invoiceIds.map((_, i) => `$${i + 1}`).join(", ");

      const query = `
        SELECT "Invoice_Details"
        FROM "info"."Invoice_Details" 
        WHERE "Invoiceid" IN (${placeholders})
      `;

      const invoiceDetailsIds = await prisma.$queryRawUnsafe(
        query,
        ...invoiceIds
      );

      detailIds = (invoiceDetailsIds as any[]).map(
        (detail) => detail.Invoice_Details
      );
    }

    // Now get all standalone warranties for this branch that are not in the current set of invoice details
    let standaloneWarranties: any[] = [];

    if (detailIds.length > 0) {
      // Create a dynamic query for the NOT IN clause
      let placeholders = detailIds.map((_, i) => `$${i + 2}`).join(", "); // +2 because $1 is reserved for branchId

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

      standaloneWarranties = await prisma.$queryRawUnsafe(
        query,
        branchId,
        ...detailIds
      );
    } else {
      standaloneWarranties = await prisma.$queryRaw`
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
    const processedStandaloneWarranties = standaloneWarranties.map(
      (warranty) => {
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
      }
    );

    // Calculate summary of active and expired warranties (for all invoices, not just paginated ones)
    // Get all warranties for this branch
    const allWarranties = await prisma.$queryRaw`
      SELECT 
        w."warrantyid", w."startdate", w."expirydate", w."status", w."branchid"
      FROM 
        "info"."warranty" w
      WHERE 
        w."branchid" = ${branchId}
    `;

    let active = 0;
    let expired = 0;

    (allWarranties as any[]).forEach((warranty) => {
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
    return NextResponse.json({ error: "خطای داخلی سرور" }, { status: 500 });
  }
}
