import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Adjust the import based on your Prisma setup
import { S3 } from "aws-sdk";

const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    const slider = await prisma.sliders.findFirst({
      where: { id: +id },
    });

    // Delete image from S3 if exists
    if (slider?.image_URL) {
      await s3
        .deleteObject({
          Bucket: process.env.LIARA_BUCKET_NAME!,
          Key: `slider-imgs/${slider.image_URL}`,
        })
        .promise();
    }

    // Delete the slider from the database
    await prisma.sliders.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ message: "اسلایدر با موفقیت حذف شد." });
  } catch (error) {
    return NextResponse.json({ error: "خطا در حذف اسلایدر." }, { status: 500 });
  }
}
