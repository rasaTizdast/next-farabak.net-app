// app/api/manageBlog/upload/route.ts
import { NextResponse } from "next/server";
import { S3 } from "aws-sdk";

const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const slug = formData.get("slug") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Blog slug is required" },
        { status: 400 }
      );
    }

    if (file.size > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size exceeds 2MB limit" },
        { status: 400 }
      );
    }

    // Sanitize filename and create unique name
    const originalName = file.name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-.]/g, "");

    const key = `blogImages/${slug}/${originalName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    await s3
      .putObject({
        Bucket: process.env.LIARA_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      })
      .promise();

    const url = key;

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
