import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET;

export const dynamic = "force-dynamic";

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload;
}

export async function GET(request: Request, props: { params: Promise<{ invoiceId: string }> }) {
  const params = await props.params;
  try {
    const invoiceId = parseInt(params.invoiceId);
    
    if (isNaN(invoiceId)) {
      return NextResponse.json(
        { error: "Invalid invoice ID" },
        { status: 400 }
      );
    }

    // Fetch the specific invoice
    const invoiceData = await prisma.$queryRaw`
      SELECT 
        i."Invoiceid", i."FactorGuid", i."Fullname", i."Phonenumber",
        i."UserId", i."TotalAmount", i."Checked", i."Date"
      FROM 
        "info"."Invoice" i
      WHERE
        i."Invoiceid" = ${invoiceId}
    `;
    
    // Check if invoice exists
    if (!invoiceData || (invoiceData as any[]).length === 0) {
      return NextResponse.json(
        { error: "Invoice not found" },
        { status: 404 }
      );
    }
    
    const invoice = (invoiceData as any[])[0];

    // Get invoice details
    const details = await prisma.$queryRaw`
      SELECT 
        id."Invoice_Details", id."ProductId", id."quantity", 
        id."price", id."total_price"
      FROM 
        "info"."Invoice_Details" id
      WHERE 
        id."Invoiceid" = ${invoiceId}
    `;

    // Get warranties for this invoice's products
    const warranties = await prisma.$queryRaw`
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

    // Process warranty status
    const processedWarranties = (warranties as any[]).map(warranty => {
      const today = new Date();
      const expiryDate = new Date(warranty.expirydate);
      
      // Add a display status without modifying the database
      let displayStatus = warranty.status;
      if (today > expiryDate) {
        displayStatus = 'Expired';
      } else {
        displayStatus = 'Active';
      }
      
      return {
        ...warranty,
        displayStatus
      };
    });

    // Group warranties by invoice detail and product
    const warrantiesByDetail = processedWarranties.reduce((acc, warranty) => {
      const key = warranty.invoicedetailid;
      if (!acc[key]) {
        acc[key] = {
          ...warranty,
          warrantycodes: [{
            code: warranty.warrantycode,
            startdate: warranty.startdate,
            expirydate: warranty.expirydate,
            status: warranty.status
          }]
        };
      } else {
        // Add this warranty code to the existing entry
        acc[key].warrantycodes.push({
          code: warranty.warrantycode,
          startdate: warranty.startdate,
          expirydate: warranty.expirydate,
          status: warranty.status
        });
      }
      return acc;
    }, {});
      
    // Map warranty data to invoice details
    const detailsWithWarranty = (details as any[]).map((detail) => {
      const warranty = warrantiesByDetail[detail.Invoice_Details];
      
      return {
        ...detail,
        warranty: warranty || null
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

    return NextResponse.json({
      ...invoice,
      Invoice_Details: sortedDetails,
    });
  } catch (error) {
    console.error("Error fetching invoice:", error);
    return NextResponse.json(
      { error: "خطا در بارگذاری فاکتور" },
      { status: 500 }
    );
  }
} 