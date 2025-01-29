import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const sliders = await prisma.sliders.findMany();
    return NextResponse.json(sliders);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch sliders" },
      { status: 500 }
    );
  }
}

const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const image_alt = formData.get("image_alt") as string;
    const link = formData.get("link") as string;

    if (!file || !link) {
      return NextResponse.json(
        { error: "فایل و لینک الزامی هستند." },
        { status: 400 }
      );
    }

    // Upload the file to S3
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `slider-imgs/${uuidv4()}-${file.name}`;

    await s3
      .putObject({
        Bucket: process.env.LIARA_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
      .promise();

    const imageUrl = key;

    // Save the slider data to the database
    const newSlider = await prisma.sliders.create({
      data: {
        image_URL: imageUrl,
        image_alt: image_alt || null,
        link,
      },
    });

    return NextResponse.json(newSlider);
  } catch (error) {
    return NextResponse.json(
      { error: "خطا در آپلود فایل یا ذخیره داده." },
      { status: 500 }
    );
  }
}
