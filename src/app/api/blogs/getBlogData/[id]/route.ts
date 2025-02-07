import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { id: number } }
) {
  const id = Number(params.id); // Convert to number

  try {
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
      return NextResponse.json({ message: "Blog not found" }, { status: 404 });
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

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching blog details:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
