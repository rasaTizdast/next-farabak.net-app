export const dynamic = "force-dynamic";

import { cn } from "@/lib/utils";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";

export const metadata: Metadata = {
  title: "بلاگ آموزشی فرابک | مقالات امنیتی",
  description:
    "مقالات تخصصی درباره خرید دوربین مداربسته، نصب محصولات بلک مجیک و نکات نگهداری سیستم‌های امنیتی. محتوای مفید و به‌روز از کارشناسان فرابک.",
  robots: {
    index: true,
    follow: true,
  },
};

type Blogs = {
  blogs: {
    id: number;
    title: string;
    SEO_Title: string;
    slug: string;
    created_at: string;
    status: string;
    views_count: number;
    content: string;
    author: string;
    SEO_description: string;
    image: string;
    image_alt: string;
    categories: {
      name: string;
      slug: string;
    }[];
    comments: number;
    likes: number;
  }[];
};

// Server-side fetch function
const fetchBlogs = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs`, {
    next: { revalidate: 60 }, // Optional: revalidate every 60 seconds for ISR
  });

  if (!response.ok) {
    throw new Error("Failed to fetch blogs");
  }

  return response.json();
};

// Server-side fetch function
const fetchCategories = async () => {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/getCategories`, {
    next: { revalidate: 60 }, // Optional: revalidate every 60 seconds for ISR
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Categories");
  }

  return response.json();
};

const BlogContent = ({
  blogs,
  categoryData,
}: {
  blogs: Blogs;
  categoryData: {
    id: number;
    name: string;
    slug: string;
  }[];
}) => {
  return (
    <div className={cn("w-full")}>
      {/* Latest Blog */}
      <div className={cn("mt-5 mb-10")}>
        <h1 className={cn("text-foreground mb-5 text-right text-3xl font-extrabold md:text-4xl")}>
          جدیدترین بلاگ
        </h1>
        <Link
          href={`/support/blog/${blogs.blogs[0].categories[0].slug}/${blogs.blogs[0].slug}`}
          className={cn(
            "relative block overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-[1.02]"
          )}
        >
          <Image
            src={`${process.env.LIARA_BUCKET_URL}/${blogs.blogs[0].image}`}
            alt={blogs.blogs[0].image_alt}
            className="h-96 w-full rounded-lg object-cover"
            width={1920}
            height={1000}
            quality={75}
            priority
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black via-transparent to-transparent p-6 text-white">
            <h2 className="mb-2 text-2xl font-bold md:text-3xl">{blogs.blogs[0].title}</h2>
            <p className="text-sm text-gray-300">
              تاریخ: {new Date(blogs.blogs[0].created_at).toLocaleDateString("fa-IR")}
            </p>
          </div>
        </Link>
      </div>

      {/* Categories Section */}
      <div className="my-16">
        <h2 className="text-foreground mb-5 text-right text-3xl font-extrabold md:text-4xl">
          دسته‌بندی‌ها
        </h2>
        <div className="flex flex-wrap justify-start gap-7">
          {categoryData.map((category) => (
            <Link
              key={category.id}
              href={`/support/blog/${category.slug}`}
              className={cn(
                "group from-primary to-secondary relative flex items-center justify-center overflow-hidden rounded-xl bg-linear-to-l px-10 py-2 text-white shadow-lg transition-[transform,box-shadow] duration-300 hover:scale-105 hover:shadow-xl"
              )}
            >
              <span className="absolute inset-0 rounded-xl bg-white opacity-10 transition duration-300 group-hover:opacity-20"></span>
              <span className="relative z-10 flex items-center gap-2 text-lg font-medium text-white">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Other Blogs */}
      <h2 className={cn("text-foreground mb-5 text-right text-3xl font-extrabold md:text-4xl")}>
        سایر بلاگ‌ها
      </h2>
      <div className={cn("grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3")}>
        {blogs.blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/support/blog/${blog.categories[0].slug}/${blog.slug}`}
            className={cn(
              "border-border bg-background block rounded-lg border shadow-lg transition-[transform,box-shadow] hover:scale-[1.02] hover:shadow-2xl"
            )}
          >
            <div className="overflow-hidden rounded-t-lg">
              <Image
                src={`${process.env.LIARA_BUCKET_URL}/${blog.image}`}
                alt={blog.image_alt}
                className="h-48 w-full object-cover transition-transform hover:scale-110"
                width={1920}
                height={1000}
                quality={75}
              />
            </div>
            <div className="p-5">
              <h3 className="text-foreground mb-2 text-lg font-semibold">{blog.title}</h3>
              <p className="text-sm text-gray-500">
                تاریخ: {new Date(blog.created_at).toLocaleDateString("fa")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const blogBreadCrumbs = ["/", "/support", "/support/blog"];

const BlogLandingPage = async () => {
  let blogData: Blogs | null = null;
  let categoryData: { id: number; name: string; slug: string }[] = [];

  // Fetch blogs
  try {
    blogData = await fetchBlogs();
  } catch (error) {
    console.error("Error fetching blog data:", error);
  }

  // Fetch categories
  try {
    categoryData = await fetchCategories();
  } catch (error) {
    console.error("Error fetching category data:", error);
  }

  if (!blogData?.blogs?.length) {
    notFound();
  }

  return (
    <div className="max-w-[1580px]">
      <Breadcrumb breadcrumbs={blogBreadCrumbs} />
      <BlogContent blogs={blogData || { blogs: [] }} categoryData={categoryData} />
    </div>
  );
};

export default BlogLandingPage;
