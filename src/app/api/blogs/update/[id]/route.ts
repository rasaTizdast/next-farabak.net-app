// app/api/blogs/update/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const blogId = parseInt(params.id);

    const blog = await prisma.blogs.update({
      where: { id: blogId },
      data: {
        content: body.content,
        status: body.status,
      },
    });

    return NextResponse.json(blog);
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "خطا در بروزرسانی وبلاگ" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const blogId = parseInt(params.id);

    // Update blog
    const updatedBlog = await prisma.blogs.update({
      where: { id: blogId },
      data: {
        title: body.title,
        SEO_Title: body.SEO_Title,
        slug: body.slug,
        author: body.author,
        SEO_description: body.SEO_description,
        image_URL: body.image_URL,
        image_alt: body.image_alt,
      },
    });

    // Update categories
    await prisma.blogCategories.deleteMany({
      where: { blog_id: blogId },
    });

    if (body.categories?.length) {
      await prisma.blogCategories.createMany({
        data: body.categories.map((categoryId: number) => ({
          blog_id: blogId,
          category_id: categoryId,
        })),
      });
    }

    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog" },
      { status: 500 }
    );
  }
}
