// app/api/blogs/delete/[id]/route.ts
import { S3 } from "aws-sdk";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY!,
  secretAccessKey: process.env.LIARA_SECRET_KEY!,
  endpoint: process.env.LIARA_ENDPOINT!,
});

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const blogId = parseInt(params.id);
    if (isNaN(blogId)) {
      return NextResponse.json({ error: "شناسه وبلاگ معتبر نیست." }, { status: 400 });
    }

    const blog = await prisma.blogs.findUnique({ where: { id: blogId } });
    if (!blog) {
      return NextResponse.json({ error: "وبلاگ مورد نظر پیدا نشد." }, { status: 404 });
    }

    // Delete relationships first
    await prisma.blogCategories.deleteMany({ where: { blog_id: blogId } });

    // Delete main blog record
    await prisma.blogs.delete({ where: { id: blogId } });

    // S3 deletion logic
    let imageDeletionSuccess = true;
    try {
      // List all objects in the blog's directory
      const prefix = `blogImages/${blog.slug}/`;
      const listedObjects = await s3
        .listObjectsV2({
          Bucket: process.env.LIARA_BUCKET_NAME!,
          Prefix: prefix,
        })
        .promise();

      // Delete all found objects
      if (listedObjects.Contents?.length) {
        const deleteParams = {
          Bucket: process.env.LIARA_BUCKET_NAME!,
          Delete: {
            Objects: listedObjects.Contents.filter(
              (object): object is { Key: string } => !!object.Key
            ).map(({ Key }) => ({ Key })),
          },
        };

        await s3.deleteObjects(deleteParams).promise();
      }
    } catch (s3Error) {
      console.error("S3 deletion error:", s3Error);
      imageDeletionSuccess = false;
    }

    return NextResponse.json({
      message:
        "وبلاگ با موفقیت حذف شد" +
        (imageDeletionSuccess ? "" : "، اما ممکن است برخی تصاویر همچنان باقی مانده باشند."),
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? `خطا در حذف وبلاگ: ${error.message}`
            : "حذف وبلاگ با خطا مواجه شد.",
      },
      { status: 500 }
    );
  }
}
