import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Generate or Update QR Code
export async function POST(request: Request) {
  try {
    const { blogId, qrCodeKey, qrCodeExpiryDays } = await request.json();

    if (!blogId || !qrCodeKey) {
      return NextResponse.json(
        { error: "Blog ID and QR Code Key are required" },
        { status: 400 }
      );
    }

    // Update the blog with the new QR code details
    const updatedBlog = await prisma.blogs.update({
      where: { id: blogId },
      data: {
        QrCode_key: qrCodeKey,
        QrCode_expiryDays: qrCodeExpiryDays || null,
      },
    });

    return NextResponse.json(updatedBlog, { status: 200 });
  } catch (error) {
    console.error("Error generating QR code:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}

// Delete QR Code
export async function DELETE(request: Request) {
  try {
    const { blogId } = await request.json();

    if (!blogId) {
      return NextResponse.json(
        { error: "Blog ID is required" },
        { status: 400 }
      );
    }

    // Remove the QR code details from the blog
    const updatedBlog = await prisma.blogs.update({
      where: { id: blogId },
      data: {
        QrCode_key: null,
        QrCode_expiryDays: null,
      },
    });

    return NextResponse.json(updatedBlog, { status: 200 });
  } catch (error) {
    console.error("Error deleting QR code:", error);
    return NextResponse.json(
      { error: "Failed to delete QR code" },
      { status: 500 }
    );
  }
}
