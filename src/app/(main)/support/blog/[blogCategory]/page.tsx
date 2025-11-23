import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";

export async function generateMetadata(props: {
  params: Promise<{ blogCategory: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/category/${params.blogCategory}`,
      {
        next: { revalidate: 60 },
      }
    );

    if (!response.ok || !response) {
      return {
        title: "صفحه یافت نشد | فرابک",
        description: "صفحه مورد نظر یافت نشد",
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    const data = await response.json();

    if (!data || data.blogs.length === 0) {
      return {
        title: "صفحه یافت نشد | فرابک",
        description: "صفحه مورد نظر یافت نشد",
        robots: {
          index: false,
          follow: true,
        },
      };
    }

    return {
      title: "مشاهده تمامی بلاگ‌‌ها | فرابک",
      description: "شما در این صفحه میتوانید تمامی بلاگ‌های فرابک را مشاهده کنید.",
    };
  } catch {
    return {
      title: "صفحه یافت نشد | فرابک",
      description: "صفحه مورد نظر یافت نشد",
      robots: {
        index: false,
        follow: true,
      },
    };
  }
}

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
const fetchBlogs = async (categorySlug: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/category/${categorySlug}`,
    {
      next: { revalidate: 60 }, // Optional: revalidate every 60 seconds for ISR
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch blogs");
  }

  return response.json();
};

const BlogContent = ({ blogs, categorySlug }: { blogs: Blogs; categorySlug: string }) => {
  const categoryDisplay = categorySlug.replace(/-/g, " ");

  return (
    <div className="w-full">
      {/* Latest Blog */}
      <div className="mb-10 mt-5">
        <h1 className="mb-5 text-right text-3xl font-extrabold text-gray-800 md:text-4xl">
          جدیدترین بلاگ ({categoryDisplay})
        </h1>
        <Link
          href={`/support/blog/${blogs.blogs[0].categories[0].slug}/${blogs.blogs[0].slug}`}
          className="relative block overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-[1.02]"
        >
          <Image
            src={`${process.env.LIARA_BUCKET_URL}/${blogs.blogs[0].image}`}
            alt={blogs.blogs[0].image_alt}
            className="h-96 w-full rounded-lg object-cover"
            width={1920}
            height={1000}
            quality={100}
            priority
          />
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black via-transparent to-transparent p-6 text-white">
            <h2 className="mb-2 text-2xl font-bold md:text-3xl">{blogs.blogs[0].title}</h2>
            <p className="text-sm text-gray-300">
              تاریخ: {new Date(blogs.blogs[0].created_at).toLocaleDateString("fa-IR")}
            </p>
          </div>
        </Link>
      </div>

      {/* Other Blogs */}
      <h2 className="mb-5 text-right text-3xl font-extrabold text-gray-800 md:text-4xl">
        سایر بلاگ‌ها
      </h2>
      <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {blogs.blogs.map((blog) => (
          <Link
            key={blog.id}
            href={`/support/blog/${blog.categories[0].slug}/${blog.slug}`}
            className="block rounded-lg border border-gray-200 bg-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-2xl"
          >
            <div className="overflow-hidden rounded-t-lg">
              <Image
                src={`${process.env.LIARA_BUCKET_URL}/${blog.image}`}
                alt={blog.image_alt}
                className="h-48 w-full object-cover transition-transform hover:scale-110"
                width={1920}
                height={1000}
                quality={100}
              />
            </div>
            <div className="p-5">
              <h3 className="mb-2 text-lg font-semibold text-gray-800">{blog.title}</h3>
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

const BlogLandingPage = async (props: { params: Promise<{ blogCategory: string }> }) => {
  const params = await props.params;
  let blogData: Blogs | null = null;

  // Fetch blogs
  try {
    const { blogCategory } = params;
    blogData = await fetchBlogs(blogCategory);

    // If no blogs are found for the given category, trigger the notFound page
    if (!blogData || blogData.blogs.length === 0) {
      notFound();
    }
  } catch (error) {
    console.error("Error fetching blog data:", error);
    notFound(); // Trigger the notFound page on error
  }

  const breadCrumbs = ["/", "/support", "/support/blog"];

  if (+!blogData?.blogs?.length < 0) {
    notFound();
  }

  return (
    <div className="max-w-[1580px]">
      <Breadcrumb breadcrumbs={breadCrumbs} />
      <BlogContent blogs={blogData || { blogs: [] }} categorySlug={params.blogCategory} />
    </div>
  );
};

export default BlogLandingPage;
