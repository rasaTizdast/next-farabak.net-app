import { S3 } from "aws-sdk";
import { NextResponse } from "next/server";

const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY,
  secretAccessKey: process.env.LIARA_SECRET_KEY,
  endpoint: process.env.LIARA_ENDPOINT,
});

function sanitizeSegment(value: string) {
  return value
    .trim()
    .replace(/[^\p{L}\p{N}._-]+/gu, "-")
    .replace(/^[.-]+|[.-]+$/g, "");
}

export async function createVideoUploadUrl(
  request: Request,
  parentPath: string,
  nestedPath?: string
) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return NextResponse.json(
      { error: "Video uploads require JSON metadata and direct S3 upload" },
      { status: 415 }
    );
  }

  const body = (await request.json()) as {
    slug?: unknown;
    fileName?: unknown;
    contentType?: unknown;
  };

  if (
    typeof body.slug !== "string" ||
    typeof body.fileName !== "string" ||
    typeof body.contentType !== "string"
  ) {
    return NextResponse.json(
      { error: "slug, fileName and contentType are required" },
      { status: 400 }
    );
  }

  const slug = sanitizeSegment(body.slug);
  const fileName = sanitizeSegment(body.fileName);
  if (!slug || !fileName || !body.contentType.startsWith("video/")) {
    return NextResponse.json({ error: "Invalid video upload metadata" }, { status: 400 });
  }

  const key = [parentPath, slug, nestedPath, fileName].filter(Boolean).join("/");
  const uploadUrl = await s3.getSignedUrlPromise("putObject", {
    Bucket: process.env.LIARA_BUCKET_NAME,
    Key: key,
    ContentType: body.contentType,
    Expires: 15 * 60,
  });

  return NextResponse.json({ uploadUrl, url: key });
}
