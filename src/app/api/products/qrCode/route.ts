import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the path based on your project structure

export async function POST(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { productId, qrCodeKey, qrCodeExpiryDays } = body;

    // Validate required fields
    if (!productId || !qrCodeKey || qrCodeExpiryDays === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: productId, qrCodeKey, or qrCodeExpiryDays",
        },
        { status: 400 }
      );
    }

    // Update the product in the database
    const updatedProduct = await prisma.product.update({
      where: { ProductId: productId },
      data: {
        QrCode_Key: qrCodeKey,
        QrCode_expiryDays: qrCodeExpiryDays,
      },
    });

    return NextResponse.json(
      {
        message: "QR Code details updated successfully",
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while updating QR Code details" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    // Parse the request body
    const body = await req.json();
    const { productId } = body;

    // Validate required field
    if (!productId) {
      return NextResponse.json(
        { error: "Missing required field: productId" },
        { status: 400 }
      );
    }

    // Update the product in the database by removing QR Code details
    const updatedProduct = await prisma.product.update({
      where: { ProductId: productId },
      data: {
        QrCode_Key: null,
        QrCode_expiryDays: null,
      },
    });

    return NextResponse.json(
      {
        message: "QR Code details removed successfully",
        product: updatedProduct,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while removing QR Code details" },
      { status: 500 }
    );
  }
}
