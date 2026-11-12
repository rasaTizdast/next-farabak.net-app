import { NextResponse } from "next/server";

import { notFoundResponse, serverErrorResponse } from "@/lib/api-response";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { invoiceIdParamSchema, validateParams } from "@/lib/validation";

export async function GET(request: Request, props: { params: Promise<{ invoiceId: string }> }) {
  const [params, auth] = await Promise.all([props.params, requireAuth()]);
  if (auth instanceof NextResponse) return auth;
  try {
    const paramValidation = validateParams(params, invoiceIdParamSchema);
    if ("error" in paramValidation) return paramValidation.error;
    const invoiceId = paramValidation.data.invoiceId;

    // Fetch the specific invoice
    const invoiceData = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT 
        i."Invoiceid", i."FactorGuid", i."Fullname", i."Phonenumber",
        i."UserId", i."TotalAmount", i."Checked", i."Date"
      FROM 
        "info"."Invoice" i
      WHERE
        i."Invoiceid" = ${invoiceId}
    `;

    // Check if invoice exists
    if (!invoiceData || invoiceData.length === 0) {
      return notFoundResponse("Invoice not found");
    }

    const invoice = invoiceData[0];

    // Get invoice details
    const details = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT 
        id."Invoice_Details", id."ProductId", id."quantity", 
        id."price", id."total_price"
      FROM 
        "info"."Invoice_Details" id
      WHERE 
        id."Invoiceid" = ${invoiceId}
    `;

    // Get warranties for this invoice's products
    const warranties = await prisma.$queryRaw<Record<string, unknown>[]>`
      SELECT 
        w."warrantyid", w."invoicedetailid", w."warrantycode", w."branchid",
        w."startdate", w."expirydate", w."status", w."ProductId"
      FROM 
        "info"."warranty" w
      JOIN 
        "info"."Invoice_Details" id ON w."invoicedetailid" = id."Invoice_Details"
      WHERE 
        id."Invoiceid" = ${invoiceId}
    `;

    interface WarrantyRaw {
      warrantyid: number;
      invoicedetailid: number;
      warrantycode: string;
      branchid: number | string;
      startdate: Date | string;
      expirydate: Date | string;
      status: string;
      ProductId: number;
      [key: string]: unknown;
    }

    interface InvoiceDetailRaw {
      Invoice_Details: number;
      ProductId: number;
      quantity: number;
      price: number;
      total_price: number;
      [key: string]: unknown;
    }

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

    // Group warranties by invoice detail and product
    const warrantiesByDetail = processedWarranties.reduce<
      Record<
        number,
        {
          warrantyid: number;
          invoicedetailid: number;
          warrantycode: string;
          branchid: number | string;
          startdate: Date | string;
          expirydate: Date | string;
          status: string;
          ProductId: number;
          displayStatus: string;
          warrantycodes: {
            code: string;
            startdate: Date | string;
            expirydate: Date | string;
            status: string;
          }[];
        }
      >
    >((acc, warranty) => {
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
        });
      }
      return acc;
    }, {});

    // Map warranty data to invoice details
    const detailsWithWarranty = (details as InvoiceDetailRaw[]).map((detail) => {
      const warranty = warrantiesByDetail[detail.Invoice_Details];

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

    return NextResponse.json({
      ...invoice,
      Invoice_Details: sortedDetails,
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return serverErrorResponse("خطا در بارگذاری فاکتور");
  }
}
