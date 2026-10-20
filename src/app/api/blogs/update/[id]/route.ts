// app/api/blogs/update/[id]/route.ts
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

import { TAGS } from "@/lib/data/tags";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
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

    revalidateTag(TAGS.blogs, "max");
    revalidateTag(TAGS.sitemap, "max");
    return NextResponse.json(blog);
  } catch (error) {
    console.error("خطا در بروزرسانی محتوای وبلاگ:", error);
    return NextResponse.json({ error: "خطا در بروزرسانی محتوای وبلاگ" }, { status: 500 });
  }
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const body = await request.json();
    const blogId = parseInt(params.id);
    if (
      body.categories !== undefined &&
      (!Array.isArray(body.categories) ||
        body.categories.some(
          (id: unknown) => typeof id !== "number" || !Number.isSafeInteger(id) || id <= 0
        ))
    ) {
      return NextResponse.json({ error: "دسته‌بندی‌های انتخاب‌شده معتبر نیستند" }, { status: 400 });
    }

    const updatedBlog = await prisma.$transaction(async (tx) => {
      const blog = await tx.blogs.update({
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

      if (body.categories !== undefined) {
        await tx.blogCategories.deleteMany({
          where: { blog_id: blogId },
        });

        if (body.categories.length) {
          await tx.blogCategories.createMany({
            data: body.categories.map((categoryId: number) => ({
              blog_id: blogId,
              category_id: categoryId,
            })),
          });
        }
      }
      return blog;
    });

    revalidateTag(TAGS.blogs, "max");
    revalidateTag(TAGS.sitemap, "max");
    return NextResponse.json(updatedBlog);
  } catch (error) {
    console.error("خطا در بروزرسانی اطلاعات وبلاگ:", error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return NextResponse.json({ error: "وبلاگی با این شناسه قبلاً وجود دارد" }, { status: 400 });
    }
    return NextResponse.json({ error: "خطا در بروزرسانی اطلاعات وبلاگ" }, { status: 500 });
  }
}
