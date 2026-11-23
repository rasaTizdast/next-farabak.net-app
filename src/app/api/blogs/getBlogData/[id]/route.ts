import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const noStoreHeaders = { "Cache-Control": "no-store" };

export async function GET(req: Request, props: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof NextResponse) {
    auth.headers.set("Cache-Control", "no-store");
    return auth;
  }
  if (!/^\d+$/.test(auth.userId)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: noStoreHeaders });
  }
  const actorId = Number(auth.userId);
  if (!Number.isSafeInteger(actorId) || actorId < 1 || actorId > 2_147_483_647) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401, headers: noStoreHeaders });
  }

  const params = await props.params;
  if (!/^\d+$/.test(params.id)) {
    return NextResponse.json(
      { message: "شناسه مقاله نامعتبر است" },
      { status: 400, headers: noStoreHeaders }
    );
  }
  const id = Number(params.id);
  if (!Number.isSafeInteger(id) || id < 1 || id > 2_147_483_647) {
    return NextResponse.json(
      { message: "شناسه مقاله نامعتبر است" },
      { status: 400, headers: noStoreHeaders }
    );
  }

  try {
    const currentUser = await prisma.client.findUnique({
      where: { UserID: actorId },
      select: { Role: true },
    });
    if (!currentUser) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401, headers: noStoreHeaders }
      );
    }
    if (currentUser.Role !== "Admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403, headers: noStoreHeaders });
    }

    // Find the blog by slug
    const blog = await prisma.blogs.findUnique({
      where: { id },
      include: {
        BlogCategories: {
          include: {
            Categories: true, // Fetch categories related to the blog
          },
        },
        Comments: true, // Fetch comments related to the blog
        Likes: true, // Fetch likes related to the blog
      },
    });

    if (!blog) {
      return NextResponse.json(
        { message: "مقاله مورد نظر یافت نشد" },
        { status: 404, headers: noStoreHeaders }
      );
    }

    // Fetch related media using the blog ID
    const media = await prisma.media.findMany({
      where: { blog_id: blog.id },
    });

    // Structure the response
    const response = {
      blog: {
        id: blog.id,
        title: blog.title,
        SEO_Title: blog.SEO_Title,
        slug: blog.slug,
        created_at: blog.created_at,
        status: blog.status,
        views_count: blog.views_count,
        content: blog.content,
        author: blog.author,
        SEO_description: blog.SEO_description,
        image_URL: blog.image_URL,
        image_alt: blog.image_alt,
      },
      categories: blog.BlogCategories.map((category) => ({
        id: category.Categories.id,
        name: category.Categories.name,
        slug: category.Categories.slug,
      })),
      comments: blog.Comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        created_at: comment.created_at,
      })),
      likes: blog.Likes.length,
      media: media.map((item) => ({
        id: item.id,
        media_type: item.media_type,
        media_URL: item.media_URL,
        media_alt: item.media_alt,
      })),
    };

    return NextResponse.json(response, { headers: noStoreHeaders });
  } catch (error) {
    console.error("خطا در دریافت جزئیات مقاله:", error);
    return NextResponse.json(
      { message: "خطای داخلی سرور" },
      { status: 500, headers: noStoreHeaders }
    );
  }
}
