import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

// Add a new endpoint to fetch blogs using a specific category
export async function GET(request: Request, props: { params: Promise<{ categoryId: string }> }) {
  const params = await props.params;
  try {
    const categoryId = Number(params.categoryId);

    const blogsUsingCategory = await prisma.blogCategories.findMany({
      where: { category_id: categoryId },
      include: {
        Blogs: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(blogsUsingCategory.map((bc) => bc.Blogs));
  } catch (error) {
    console.error("[API] خطا در دریافت بلاگ‌ها بر اساس دسته‌بندی:", error);
    return NextResponse.json({ error: "خطا در دریافت بلاگ‌ها" }, { status: 500 });
  }
}
