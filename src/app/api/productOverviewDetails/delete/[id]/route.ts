import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { S3 } from "aws-sdk";

const prisma = new PrismaClient();

// Initialize S3 client
const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const detailId = parseInt(params.id);

    if (isNaN(detailId)) {
      return NextResponse.json({ error: "Invalid Detail ID" }, { status: 400 });
    }

    // Get the overview detail record to get the image path for deletion
    const overviewDetail =
      await prisma.master_ProductOverviewDetails.findUnique({
        where: {
          ProductOverviewDetailsId: detailId,
        },
      });

    if (!overviewDetail) {
      return NextResponse.json(
        { error: "Overview detail not found" },
        { status: 404 }
      );
    }

    // Get the image path
    const imagePath = overviewDetail.Img;

    // First, delete all product associations
    await prisma.details_ProductOverviewDetails.deleteMany({
      where: {
        ProductOverviewDetailsId: detailId,
      },
    });

    // Then delete the overview detail itself
    await prisma.master_ProductOverviewDetails.delete({
      where: {
        ProductOverviewDetailsId: detailId,
      },
    });

    // Finally, delete the image from S3 storage if it exists
    if (imagePath) {
      try {
        const deleteParams = {
          Bucket: process.env.LIARA_BUCKET_NAME as string,
          Key: `overview-details-images${imagePath}`,
        };

        await s3.deleteObject(deleteParams).promise();
      } catch (s3Error) {
        console.error("Error deleting image from S3:", s3Error);
        // Continue with the operation even if image deletion fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting overview detail:", error);
    return NextResponse.json(
      { error: "Failed to delete overview detail" },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
