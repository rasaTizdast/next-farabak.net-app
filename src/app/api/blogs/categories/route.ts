// app/api/blogs/categories/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const categories = await prisma.categories.findMany();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-");

    const newCategory = await prisma.categories.create({
      data: { name, slug },
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    if ((error as any).code === "P2002") {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { id, force } = await request.json();
    console.log("[API] Delete category request for ID:", id);

    // Check if category is used in any blog post
    const blogsWithCategory = await prisma.blogCategories.findMany({
      where: { category_id: Number(id) },
      include: { Blogs: { select: { title: true, id: true } } },
    });

    console.log("[API] Category usage check result:", blogsWithCategory);

    if (blogsWithCategory.length > 0) {
      // If not forced and category is in use
      if (!force) {
        return NextResponse.json(
          {
            error: "Cannot delete category used in blog posts",
            blogs: blogsWithCategory.map((bc) => ({
              id: bc.Blogs.id,
              title: bc.Blogs.title,
            })),
          },
          { status: 400 }
        );
      }

      // If forced, delete associated blogs and then the category
      await prisma.$transaction(async (tx) => {
        // Delete blog categories first
        await tx.blogCategories.deleteMany({
          where: { category_id: Number(id) },
        });

        // Delete associated blogs
        await tx.blogs.deleteMany({
          where: {
            id: {
              in: blogsWithCategory.map((bc) => bc.Blogs.id),
            },
          },
        });

        // Delete the category
        await tx.categories.delete({
          where: { id: Number(id) },
        });
      });

      console.log("[API] Successfully deleted category and associated blogs");
      return NextResponse.json({
        message: "Category and associated blogs deleted",
        deletedBlogs: blogsWithCategory.length,
      });
    }

    // If no blogs are using the category, proceed with normal deletion
    const deletedCategory = await prisma.categories.delete({
      where: { id: Number(id) },
    });

    console.log("[API] Successfully deleted category:", deletedCategory);
    return NextResponse.json(deletedCategory);
  } catch (error) {
    console.error("[API] Delete category error:", error);
    if ((error as any).code === "P2025") {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
