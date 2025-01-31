// app/api/blogs/delete/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { S3 } from "aws-sdk";

const s3 = new S3({
  accessKeyId: process.env.LIARA_ACCESS_KEY!,
  secretAccessKey: process.env.LIARA_SECRET_KEY!,
  endpoint: process.env.LIARA_ENDPOINT!,
});

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const blogId = parseInt(params.id);
    if (isNaN(blogId)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const blog = await prisma.blogs.findUnique({ where: { id: blogId } });
    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
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
        "Blog deleted successfully" +
        (imageDeletionSuccess ? "" : ", but some images might remain"),
    });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to delete blog",
      },
      { status: 500 }
    );
  }
}
