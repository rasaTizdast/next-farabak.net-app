import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Assuming you have a Prisma client setup
import { S3 } from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

export async function GET() {
  try {
    const products = await prisma.showcase_products.findMany();
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch showcase products" },
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
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const order = parseInt(formData.get("order") as string);
    const link = formData.get("link") as string;

    if (!file || !title || !description || isNaN(order) || !link) {
      return NextResponse.json(
        { error: "داده‌های ورودی نامعتبر هستند." },
        { status: 400 }
      );
    }

    // Upload the file to S3
    const buffer = Buffer.from(await file.arrayBuffer());
    const key = `product-showCase/${uuidv4()}-${file.name}`;

    await s3
      .putObject({
        Bucket: process.env.LIARA_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
      .promise();

    const imageUrl = key;

    // Save the showcase product data to the database
    const newShowcaseProduct = await prisma.showcase_products.create({
      data: {
        title,
        description,
        order,
        image: imageUrl,
        link,
      },
    });

    return NextResponse.json(newShowcaseProduct);
  } catch (error) {
    return NextResponse.json(
      { error: "خطا در آپلود فایل یا ذخیره داده." },
      { status: 500 }
    );
  }
}
