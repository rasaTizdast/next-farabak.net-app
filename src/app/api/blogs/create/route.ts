// app/api/blogs/create/route.ts
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { TAGS } from "@/lib/data/tags";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) return auth;
  if (auth.role !== "Admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const body = await request.json();
    if (
      body.categories !== undefined &&
      (!Array.isArray(body.categories) ||
        body.categories.some(
          (id: unknown) => typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0
        ))
    ) {
      return NextResponse.json({ error: "دسته‌بندی‌های انتخاب‌شده معتبر نیستند" }, { status: 400 });
    }

    const blog = await prisma.$transaction(async (tx) => {
      const createdBlog = await tx.blogs.create({
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
        await tx.blogCategories.createMany({
          data: body.categories.map((categoryId: number) => ({
            blog_id: createdBlog.id,
            category_id: categoryId,
          })),
        });
      }
      return createdBlog;
    });

    revalidateTag(TAGS.blogs, "max");
    revalidateTag(TAGS.sitemap, "max");
    return NextResponse.json(blog);
  } catch (error) {
    console.error("خطا در ایجاد بلاگ:", error);
    if ((error as any).code === "P2002") {
      return NextResponse.json({ error: "بلاگی با این اسلاگ قبلاً وجود دارد" }, { status: 400 });
    }
    return NextResponse.json({ error: "ایجاد بلاگ با مشکل مواجه شد" }, { status: 500 });
  }
}
