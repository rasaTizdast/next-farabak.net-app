import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch a specific FAQ by ID
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid FAQ ID" },
        { status: 400 }
      );
    }

    const faq = await prisma.faqDetails.findUnique({
      where: { FaqDetailsid: id },
    });

    if (!faq) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ faq }, { status: 200 });
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return NextResponse.json(
      { error: "Failed to fetch FAQ" },
      { status: 500 }
    );
  }
}

// PUT: Update a specific FAQ
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid FAQ ID" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { Q, A, Available } = body;

    // Check if FAQ exists
    const existingFaq = await prisma.faqDetails.findUnique({
      where: { FaqDetailsid: id },
    });

    if (!existingFaq) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      );
    }

    // Update FAQ
    const updatedFaq = await prisma.faqDetails.update({
      where: { FaqDetailsid: id },
      data: {
        Q: Q ?? existingFaq.Q,
        A: A ?? existingFaq.A,
        Available: Available !== undefined ? Available : existingFaq.Available,
        ModifyDate: new Date(),
      },
    });

    return NextResponse.json({ faq: updatedFaq }, { status: 200 });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return NextResponse.json(
      { error: "Failed to update FAQ" },
      { status: 500 }
    );
  }
}

// DELETE: Delete a specific FAQ
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid FAQ ID" },
        { status: 400 }
      );
    }

    // Check if FAQ exists
    const existingFaq = await prisma.faqDetails.findUnique({
      where: { FaqDetailsid: id },
    });

    if (!existingFaq) {
      return NextResponse.json(
        { error: "FAQ not found" },
        { status: 404 }
      );
    }

    // Delete FAQ
    await prisma.faqDetails.delete({
      where: { FaqDetailsid: id },
    });

    return NextResponse.json(
      { message: "FAQ deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return NextResponse.json(
      { error: "Failed to delete FAQ" },
      { status: 500 }
    );
  }
} 