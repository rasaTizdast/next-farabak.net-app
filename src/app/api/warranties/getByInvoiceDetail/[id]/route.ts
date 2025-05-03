import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Fetches warranty information for a specific invoice detail ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceDetailId = parseInt(params.id);

    if (isNaN(invoiceDetailId)) {
      return NextResponse.json(
        { error: "شناسه جزئیات فاکتور نامعتبر است" },
        { status: 400 }
      );
    }

    // Get warranty information for this invoice detail
    const warranty = await prisma.warranty.findFirst({
      where: {
        invoicedetailid: invoiceDetailId,
      },
    });

    return NextResponse.json({ warranty });
  } catch (error) {
    console.error("Error fetching warranty:", error);
    return NextResponse.json(
      { error: "خطایی هنگام دریافت اطلاعات گارانتی رخ داده است" },
      { status: 500 }
    );
  }
}
