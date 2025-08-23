// app/api/products/productBlog/delete/route.ts
import { S3 } from "aws-sdk";
import { NextResponse } from "next/server";

const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

export async function DELETE(request: Request) {
  try {
    const { key } = await request.json();

    await s3
      .deleteObject({
        Bucket: process.env.LIARA_BUCKET_NAME!,
        Key: key,
      })
      .promise();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
}
