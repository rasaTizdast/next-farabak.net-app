import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  req: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  try {
    const detailId = parseInt(params.id);

    if (isNaN(detailId)) {
      return NextResponse.json({ error: "Invalid Detail ID" }, { status: 400 });
    }

    // Check if the overview detail is being used by any products
    const usageCount = await prisma.details_ProductOverviewDetails.count({
      where: {
        ProductOverviewDetailsId: detailId,
      },
    });

    return NextResponse.json({
      isInUse: usageCount > 0,
      productsCount: usageCount,
    });
  } catch (error) {
    console.error("Error checking overview detail usage:", error);
    return NextResponse.json(
      { error: "Failed to check overview detail usage" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
