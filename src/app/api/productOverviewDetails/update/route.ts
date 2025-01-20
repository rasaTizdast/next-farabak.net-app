import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust path to your Prisma instance

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { productId, selectedDetails, ProductName } = body;

    // Validate input
    if (!productId || !Array.isArray(selectedDetails) || !ProductName) {
      return NextResponse.json(
        {
          error:
            "Invalid input. 'productId' and 'selectedDetails' are required.",
        },
        { status: 400 }
      );
    }

    // Fetch current overview details for the product
    const currentDetails = await prisma.details_ProductOverviewDetails.findMany(
      {
        where: { productid: productId },
        select: { ProductOverviewDetailsId: true },
      }
    );

    const currentDetailIds = currentDetails
      .map((detail) => detail.ProductOverviewDetailsId)
      .filter((id): id is number => id !== null); // Ensure non-null values

    // Extract IDs from selectedDetails
    const selectedDetailIds = selectedDetails
      .map(
        (detail: { ProductOverviewDetailsId: number | null }) =>
          detail.ProductOverviewDetailsId
      )
      .filter((id): id is number => id !== null); // Ensure non-null values

    // Determine new details to add
    const detailsToAdd = selectedDetailIds.filter(
      (id) => !currentDetailIds.includes(id)
    );

    // Determine details to remove
    const detailsToRemove = currentDetailIds.filter(
      (id) => !selectedDetailIds.includes(id)
    );

    // Perform database updates
    const addPromises = detailsToAdd.map((id) =>
      prisma.details_ProductOverviewDetails.create({
        data: {
          ProductName,
          ProductOverviewDetailsId: id,
          productid: productId,
        },
      })
    );

    const removePromises = detailsToRemove.map((id) =>
      prisma.details_ProductOverviewDetails.deleteMany({
        where: {
          ProductOverviewDetailsId: id,
          productid: productId,
        },
      })
    );

    await Promise.all([...addPromises, ...removePromises]);

    return NextResponse.json({
      message: "Product overview details updated successfully",
    });
  } catch (error) {
    console.error("Error updating product overview details:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
