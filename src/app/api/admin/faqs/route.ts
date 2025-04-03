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
    console.error("Error fetching FAQs:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQs" },
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
      return NextResponse.json(
        { error: "Question and answer are required" },
        { status: 400 }
      );
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
    console.error("Error creating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to create FAQ" },
      { status: 500 }
    );
  }
} 