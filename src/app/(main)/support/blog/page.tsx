import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import React, { Suspense } from "react";
import blogs from "@/constants/blogData.json"; // Simulated JSON data
import { Metadata } from "next";
import BlogSkeleton from "@/app/_components/ui/BlogSkeleton";

export const metadata: Metadata = {
  title: "مشاهده تمامی بلاگ‌‌ها | فرابک",
  description: "شما در این صفحه میتوانید تمامی بلاگ‌های فرابک را مشاهده کنید.",
};

// Mock API fetcher (replace with real API fetch later)
const fetchBlogs = async () => {
  return new Promise<typeof blogs>(
    (resolve) => setTimeout(() => resolve(blogs), 1000) // Simulate 1 second delay
  );
};

const BlogContent = async () => {
  const blogData = await fetchBlogs();

  // Sort blogs by date (most recent first)
  const sortedBlogs = blogData.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Separate the latest blog
  const [latestBlog, ...otherBlogs] = sortedBlogs;

  // Extract unique categories from blogs
  const categories = Array.from(new Set(blogData.map((blog) => blog.category)));

  return (
    <div className="w-full">
      {/* Latest Blog */}
      <div className="mt-5 mb-10">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-5 text-right text-gray-800">
          جدیدترین بلاگ
        </h1>
        <Link
          href={`/support/blog/${latestBlog.category}/${latestBlog.slug}`}
          className="block relative overflow-hidden rounded-lg shadow-lg hover:scale-[1.02] transition-transform"
        >
          <Image
            src={latestBlog.img}
            alt={latestBlog.title}
            className="w-full h-96 object-cover rounded-lg"
            width={1920}
            height={1000}
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6 text-white">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">
              {latestBlog.title}
            </h2>
            <p className="text-sm text-gray-300">
              تاریخ: {new Date(latestBlog.date).toLocaleDateString("fa-IR")}
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
          {categories.map((category) => (
            <Link
              key={category}
              href={`/support/blog/${category}`}
              className="group relative flex items-center justify-center overflow-hidden rounded-xl bg-gradient-to-l from-[#0e6aff] to-[#1e90ff] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 px-10 py-2"
            >
              <span className="absolute inset-0 bg-white opacity-10 group-hover:opacity-20 transition duration-300 rounded-xl"></span>
              <span className="relative z-10 text-white font-medium text-lg flex items-center gap-2">
                {category}
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
        {otherBlogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/support/blog/${blog.category}/${blog.slug}`}
            className="block border border-gray-200 rounded-lg shadow-lg hover:shadow-2xl transition-all hover:scale-[1.02] bg-white"
          >
            <div className="overflow-hidden rounded-t-lg">
              <Image
                src={blog.img}
                alt={blog.title}
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
                تاریخ: {new Date(blog.date).toLocaleDateString("fa-IR")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const BlogLandingPage = () => {
  const breadCrumbs = [
    { path: "/" },
    { path: "/support" },
    { path: "/support/blog" },
  ];

  return (
    <>
      <Breadcrumb breadcrumbs={breadCrumbs} />
      <Suspense fallback={<BlogSkeleton />}>
        <BlogContent />
      </Suspense>
    </>
  );
};

export default BlogLandingPage;
