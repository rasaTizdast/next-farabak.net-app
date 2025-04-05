import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Public endpoint for checking warranty status and updating it to "Requested"
 * Supports two modes:
 * 1. checkOnly - Just retrieve warranty info without changing status
 * 2. confirm - Confirm the warranty request and update the status
 */
export async function POST(request: Request) {
  try {
    const { warrantycode, checkOnly = false, confirm = false } = await request.json();
    
    if (!warrantycode) {
      return NextResponse.json(
        { error: 'کد گارانتی نمی‌تواند خالی باشد' },
        { status: 400 }
      );
    }
    
    // Check if warranty exists and get its details
    const warranty = await prisma.$queryRaw`
      SELECT w.*, i."Fullname" as customer_name, i."Phonenumber" as customer_phone 
      FROM "info"."warranty" w
      LEFT JOIN "info"."Invoice_Details" id ON w."invoicedetailid" = id."Invoice_Details"
      LEFT JOIN "info"."Invoice" i ON id."Invoiceid" = i."Invoiceid"
      WHERE w."warrantycode" = ${warrantycode}
      LIMIT 1
    `;
    
    if ((warranty as any[]).length === 0) {
      return NextResponse.json(
        { error: 'کد گارانتی وارد شده معتبر نیست' },
        { status: 404 }
      );
    }

    const warrantyData = (warranty as any[])[0];
    
    // Check if warranty is expired
    const today = new Date();
    const expiryDate = new Date(warrantyData.expirydate);
    const isExpired = expiryDate < today;
    
    // If checkOnly flag is true, just return the warranty data without changing status
    if (checkOnly) {
      if (isExpired) {
        return NextResponse.json({
          status: "expired",
          message: "مدت زمان گارانتی به پایان رسیده است",
          data: {
            isValid: false,
            expiryDate: warrantyData.expirydate,
            startDate: warrantyData.startdate,
            status: warrantyData.status,
            customerName: warrantyData.customer_name,
            customerPhone: warrantyData.customer_phone
          }
        });
      } else if (warrantyData.status === "Requested") {
        return NextResponse.json({
          status: "already_requested",
          message: "این گارانتی قبلاً درخواست بررسی شده است",
          data: {
            isValid: true,
            expiryDate: warrantyData.expirydate,
            startDate: warrantyData.startdate,
            status: warrantyData.status,
            customerName: warrantyData.customer_name,
            customerPhone: warrantyData.customer_phone
          }
        });
      } else {
        return NextResponse.json({
          status: "active",
          message: "گارانتی فعال است",
          data: {
            isValid: true,
            expiryDate: warrantyData.expirydate,
            startDate: warrantyData.startdate,
            status: warrantyData.status,
            customerName: warrantyData.customer_name,
            customerPhone: warrantyData.customer_phone
          }
        });
      }
    }
    
    // If we get here, it's a confirmation of the request
    if (confirm) {
      // If warranty is active, update status to "Requested"
      if (warrantyData.status === "Active" && !isExpired) {
        await prisma.$queryRaw`
          UPDATE "info"."warranty"
          SET "status" = 'Requested'
          WHERE "warrantyid" = ${warrantyData.warrantyid}
        `;
        
        return NextResponse.json({
          status: "success",
          message: "درخواست بررسی گارانتی با موفقیت ثبت شد",
          data: {
            isValid: true,
            expiryDate: warrantyData.expirydate,
            startDate: warrantyData.startdate,
            status: "Requested",
            customerName: warrantyData.customer_name,
            customerPhone: warrantyData.customer_phone
          }
        });
      } 
      else if (isExpired) {
        return NextResponse.json({
          status: "expired",
          message: "مدت زمان گارانتی به پایان رسیده است",
          data: {
            isValid: false,
            expiryDate: warrantyData.expirydate,
            startDate: warrantyData.startdate,
            status: warrantyData.status,
            customerName: warrantyData.customer_name,
            customerPhone: warrantyData.customer_phone
          }
        });
      }
      else {
        return NextResponse.json({
          status: "already_requested",
          message: "این گارانتی قبلاً درخواست بررسی شده است",
          data: {
            isValid: true,
            expiryDate: warrantyData.expirydate,
            startDate: warrantyData.startdate,
            status: warrantyData.status,
            customerName: warrantyData.customer_name,
            customerPhone: warrantyData.customer_phone
          }
        });
      }
    }

    // Legacy path for backward compatibility
    if (warrantyData.status === "Active" && !isExpired) {
      await prisma.$queryRaw`
        UPDATE "info"."warranty"
        SET "status" = 'Requested'
        WHERE "warrantyid" = ${warrantyData.warrantyid}
      `;
      
      return NextResponse.json({
        status: "success",
        message: "درخواست بررسی گارانتی با موفقیت ثبت شد",
        data: {
          isValid: true,
          expiryDate: warrantyData.expirydate,
          startDate: warrantyData.startdate,
          status: "Requested",
          customerName: warrantyData.customer_name,
          customerPhone: warrantyData.customer_phone
        }
      });
    } 
    else if (isExpired) {
      return NextResponse.json({
        status: "expired",
        message: "مدت زمان گارانتی به پایان رسیده است",
        data: {
          isValid: false,
          expiryDate: warrantyData.expirydate,
          startDate: warrantyData.startdate,
          status: warrantyData.status,
          customerName: warrantyData.customer_name,
          customerPhone: warrantyData.customer_phone
        }
      });
    }
    else {
      return NextResponse.json({
        status: "already_requested",
        message: "این گارانتی قبلاً درخواست بررسی شده است",
        data: {
          isValid: true,
          expiryDate: warrantyData.expirydate,
          startDate: warrantyData.startdate,
          status: warrantyData.status,
          customerName: warrantyData.customer_name,
          customerPhone: warrantyData.customer_phone
        }
      });
    }
  } catch (error) {
    console.error('Error checking warranty status:', error);
    return NextResponse.json(
      { error: 'خطا در بررسی وضعیت گارانتی' },
      { status: 500 }
    );
  }
} 