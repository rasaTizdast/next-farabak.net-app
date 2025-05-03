// app/api/blogs/create/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Create blog
    const blog = await prisma.blogs.create({
      data: {
        title: body.title,
        SEO_Title: body.SEO_Title,
        slug: body.slug,
        author: body.author,
        SEO_description: body.SEO_description,
        image_URL: body.image_URL,
        image_alt: body.image_alt,
        status: "Draft",
        created_at: new Date().toISOString(),
        content: "",
        views_count: 0,
      },
    });

    // Create blog-category relationships
    if (body.categories?.length) {
      await prisma.blogCategories.createMany({
        data: body.categories.map((categoryId: number) => ({
          blog_id: blog.id,
          category_id: categoryId,
        })),
      });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error("خطا در ایجاد بلاگ:", error);
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { error: "بلاگی با این اسلاگ قبلاً وجود دارد" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "ایجاد بلاگ با مشکل مواجه شد" },
      { status: 500 }
    );
  }
}
