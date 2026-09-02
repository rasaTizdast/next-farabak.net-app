import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { getBlogsByCategory } from "@/lib/data/blogs";
import { cn } from "@/lib/utils";

export async function generateMetadata(props: {
  params: Promise<{ blogCategory: string }>;
}): Promise<Metadata> {
  const params = await props.params;

  try {
    const data = (await getBlogsByCategory(params.blogCategory)) as Blogs | null;

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

const BlogContent = ({ blogs, categorySlug }: { blogs: Blogs; categorySlug: string }) => {
  const categoryDisplay = categorySlug.replace(/-/g, " ");

  return (
    <div className={cn("w-full")}>
      {/* Latest Blog */}
      <div className={cn("mt-5 mb-10")}>
        <h1 className={cn("text-foreground mb-5 text-right text-3xl font-extrabold md:text-4xl")}>
          جدیدترین بلاگ ({categoryDisplay})
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
              <p className="text-muted-foreground text-sm">
                تاریخ: {new Date(blog.created_at).toLocaleDateString("fa")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const blogCategoryBreadCrumbs = ["/", "/support", "/support/blog"];

const BlogLandingPage = async (props: { params: Promise<{ blogCategory: string }> }) => {
  const params = await props.params;
  const { blogCategory } = params;

  let blogData: Blogs | null = null;
  try {
    blogData = (await getBlogsByCategory(blogCategory)) as Blogs;
  } catch {
    notFound();
  }

  if (!blogData || blogData.blogs.length === 0) {
    notFound();
  }

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const bucketUrl = process.env.LIARA_BUCKET_URL || "";
  const blogIndexUrl = `${siteUrl}/support/blog`;
  const categoryUrl = `${blogIndexUrl}/${params.blogCategory}`;
  const categoryName = params.blogCategory.replace(/-/g, " ");

  const categoryItemList = blogData.blogs
    .flatMap((blog) => {
      const blogCategorySlug = blog.categories?.[0]?.slug;
      if (!blogCategorySlug) return [];
      const postUrl = `${blogIndexUrl}/${blogCategorySlug}/${blog.slug}`;
      return [
        {
          "@type": "ListItem",
          url: postUrl,
          item: {
            "@type": "BlogPosting",
            "@id": `${postUrl}#blogPosting`,
            headline: blog.title,
            url: postUrl,
            datePublished: blog.created_at,
            image: blog.image ? `${bucketUrl}/${blog.image}` : undefined,
            author: { "@type": "Person", name: blog.author },
          },
        },
      ];
    })
    .map((listItem, index) => ({ ...listItem, position: index + 1 }));

  const categoryStructuredData = serializeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebPage", "CollectionPage"],
        "@id": `${categoryUrl}#collection`,
        url: categoryUrl,
        name: `مقالات دسته‌بندی ${categoryName} | فرابک`,
        description: `جدیدترین مقالات، آموزش‌ها و راهنمای‌های بلاگ فرابک درباره ${categoryName}.`,
        inLanguage: "fa-IR",
        isPartOf: { "@id": `${blogIndexUrl}#blog` },
        mainEntity: { "@id": `${categoryUrl}#itemlist` },
      },
      {
        "@type": "Blog",
        "@id": `${blogIndexUrl}#blog`,
        name: "وبلاگ فرابک",
        url: blogIndexUrl,
        description:
          "مقالات تخصصی درباره خرید دوربین مداربسته، نصب محصولات بلک مجیک و نکات نگهداری سیستم‌های امنیتی. محتوای مفید و به‌روز از کارشناسان فرابک.",
        inLanguage: "fa-IR",
        publisher: {
          "@type": "Organization",
          name: "فرابک",
          url: siteUrl || undefined,
          logo: {
            "@type": "ImageObject",
            url: `${siteUrl}/Farabak_Logo.webp`,
          },
        },
      },
      {
        "@type": "ItemList",
        "@id": `${categoryUrl}#itemlist`,
        itemListElement: categoryItemList,
      },
    ],
  });

  return (
    <div className="w-full max-w-[1580px]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: categoryStructuredData }}
      />
      <Breadcrumb breadcrumbs={blogCategoryBreadCrumbs} />
      <BlogContent blogs={blogData || { blogs: [] }} categorySlug={params.blogCategory} />
    </div>
  );
};

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default BlogLandingPage;
