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
