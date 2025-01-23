export const dynamic = "force-dynamic";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "مشاهده تمامی بلاگ‌‌ها | فرابک",
  description: "شما در این صفحه میتوانید تمامی بلاگ‌های فرابک را مشاهده کنید.",
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
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs`,
    {
      next: { revalidate: 60 }, // Optional: revalidate every 60 seconds for ISR
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch blogs");
  }

  return response.json();
};

// Server-side fetch function
const fetchCategories = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/getCategories`,
    {
      next: { revalidate: 60 }, // Optional: revalidate every 60 seconds for ISR
    }
  );

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
    <div className="w-full">
      {/* Latest Blog */}
      <div className="mt-5 mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-5 text-right text-gray-800">
          جدیدترین بلاگ
        </h1>
        <Link
          href={`/support/blog/${blogs.blogs[0].categories[0].slug}/${blogs.blogs[0].slug}`}
          className="block relative overflow-hidden rounded-lg shadow-lg hover:scale-[1.02] transition-transform"
        >
          <Image
            src={`${process.env.LIARA_BUCKET_URL}/blogImages/${blogs.blogs[0].image}`}
            alt={blogs.blogs[0].image_alt}
            className="w-full h-96 object-cover rounded-lg"
            width={1920}
            height={1000}
            quality={100}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {blogs.blogs[0].title}
            </h2>
            <p className="text-sm text-gray-300">
              تاریخ:{" "}
              {new Date(blogs.blogs[0].created_at).toLocaleDateString("fa-IR")}
            </p>
          </div>
        </Link>
      </div>

      {/* Categories Section */}
      <div className="my-16">
        <h2 className="text-3xl md:text-4xl font-extrabold mb-5 text-right text-gray-800">
          دسته‌بندی‌ها
        </h2>
        <div className="flex flex-wrap justify-start gap-7">
          {categoryData.map((category) => (
            <Link
              key={category.id}
              href={`/support/blog/${category.slug}`}
              className="group relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-l from-[#0e6aff] to-[#1e90ff] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 px-10 py-2"
            >
              <span className="absolute inset-0 bg-white opacity-10 group-hover:opacity-20 transition duration-300 rounded-xl"></span>
              <span className="relative z-10 text-white font-medium text-lg flex items-center gap-2">
                {category.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Other Blogs */}
      <h2 className="text-3xl md:text-4xl font-extrabold mb-5 text-right text-gray-800">
        سایر بلاگ‌ها
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/support/blog/${blog.categories[0].slug}/${blog.slug}`}
            className="block border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] bg-white"
          >
            <div className="overflow-hidden rounded-t-lg">
              <Image
                src={`${process.env.LIARA_BUCKET_URL}/blogImages/${blog.image}`}
                alt={blog.image_alt}
                className="w-full h-48 object-cover hover:scale-110 transition-transform"
                width={1920}
                height={1000}
                quality={100}
              />
            </div>
            <div className="p-5">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">
                {blog.title}
              </h3>
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

  const breadCrumbs = ["/", "/support", "/support/blog"];

  return (
    <>
      <Breadcrumb breadcrumbs={breadCrumbs} />
      <BlogContent
        blogs={blogData || { blogs: [] }}
        categoryData={categoryData}
      />
    </>
  );
};

export default BlogLandingPage;
