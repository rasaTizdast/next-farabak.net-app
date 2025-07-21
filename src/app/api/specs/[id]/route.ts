import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/specs/[id] - Get specs for a specific product
export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const productId = parseInt(params.id);

    if (isNaN(productId)) {
      return NextResponse.json(
        { message: "Invalid product ID" },
        { status: 400 }
      );
    }

    const specs = await prisma.productSpecs.findMany({
      where: {
        ProductId: productId,
        Available: true,
      },
      select: {
        ProductSpecsId: true,
        Title: true,
        Description: true,
      },
    });

    return NextResponse.json(specs);
  } catch (error) {
    console.error("Error fetching product specs:", error);
    return NextResponse.json(
      { message: "Error fetching product specs" },
      { status: 500 }
    );
  }
}
