import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// GET: Fetch all FAQs
export async function GET() {
  try {
    const faqs = await prisma.faqDetails.findMany({
      orderBy: {
        InsertDate: "desc",
      },
      select: {
        FaqDetailsid: true,
        Q: true,
        A: true,
        Available: true,
        InsertDate: true,
        ModifyDate: true,
      },
    });

    return NextResponse.json({ faqs }, { status: 200 });
  } catch (error) {
    // More detailed error logging
    console.error("Error fetching FAQs:", error);

    // Determine if it's a Prisma error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorName = error instanceof Error ? error.name : "Unknown error type";

    console.error(`FAQ fetching failed. Error type: ${errorName}, Message: ${errorMessage}`);

    return NextResponse.json(
      {
        error: "خطا در دریافت سوالات متداول. لطفا مجددا تلاش کنید.",
        details: process.env.NODE_ENV !== "production" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

// POST: Create a new FAQ
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { Q, A, Available } = body;

    if (!Q || !A) {
      return NextResponse.json({ error: "وارد کردن سوال و پاسخ الزامی است." }, { status: 400 });
    }

    const newFaq = await prisma.faqDetails.create({
      data: {
        Q,
        A,
        Available: Available ?? true,
        InsertDate: new Date(),
        ModifyDate: new Date(),
      },
    });

    return NextResponse.json({ faq: newFaq }, { status: 201 });
  } catch (error) {
    // More detailed error logging
    console.error("Error creating FAQ:", error);

    // Determine if it's a Prisma error
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorName = error instanceof Error ? error.name : "Unknown error type";

    console.error(`FAQ creation failed. Error type: ${errorName}, Message: ${errorMessage}`);

    return NextResponse.json(
      {
        error: "خطا در ایجاد سوال متداول جدید. لطفا مجددا تلاش کنید.",
        details: process.env.NODE_ENV !== "production" ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
