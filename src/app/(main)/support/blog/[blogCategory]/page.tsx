import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import { Metadata } from "next";
import blogs from "@/constants/blogData.json";
import BlogSkeleton from "@/app/_components/ui/BlogSkeleton"; // Import the skeleton component
import React, { Suspense } from "react";

// Simulate API loading delay
const fetchCategoryBlogs = async (blogCategory: string) => {
  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated delay
  return blogs.filter((blog) => blog.category === blogCategory);
};

// Dynamic metadata for SEO
export const generateMetadata = async ({
  params,
}: {
  params: { blogCategory: string };
}): Promise<Metadata> => {
  const { blogCategory } = params;
  return {
    title: `مشاهده بلاگ‌های دسته‌بندی ${blogCategory} | فرابک`,
    description: `در این صفحه می‌توانید بلاگ‌های دسته‌بندی ${blogCategory} را مشاهده کنید.`,
  };
};

const BlogCategoryPage = async ({
  params,
}: {
  params: { blogCategory: string };
}) => {
  const { blogCategory } = params;

  // Fetch category-specific blogs
  const categoryBlogs = await fetchCategoryBlogs(blogCategory);

  // Sort blogs by date (most recent first)
  const sortedBlogs = categoryBlogs.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Breadcrumb for navigation
  const breadCrumbs = [
    { href: "/", path: "/" },
    { href: "/support", path: "/support" },
    { href: "/support/blog", path: "/support/blog" },
    {
      href: `/support/blog/${blogCategory}`,
      path: `/support/blog/${blogCategory}`,
    },
  ];

  return (
    <>
      <Breadcrumb breadcrumbs={breadCrumbs} />
      <Suspense fallback={<BlogSkeleton />}>
        <div className="w-full">
          {/* Latest Blog */}
          {sortedBlogs.length > 0 && (
            <div className="mt-5 mb-10">
              <h1 className="text-3xl md:text-4xl font-extrabold mb-5 text-right text-gray-800">
                جدیدترین بلاگ از دسته‌بندی {blogCategory}
              </h1>
              <Link
                href={`/support/blog/${blogCategory}/${sortedBlogs[0].slug}`}
                className="block relative overflow-hidden rounded-lg shadow-lg hover:scale-[1.02] transition-transform"
              >
                <Image
                  src={sortedBlogs[0].img}
                  alt={sortedBlogs[0].title}
                  className="w-full h-96 object-cover rounded-lg"
                  width={1920}
                  height={1000}
                  quality={100}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                  <h2 className="text-2xl md:text-3xl font-bold mb-2">
                    {sortedBlogs[0].title}
                  </h2>
                  <p className="text-sm text-gray-300">
                    تاریخ:{" "}
                    {new Date(sortedBlogs[0].date).toLocaleDateString("fa-IR")}
                  </p>
                </div>
              </Link>
            </div>
          )}

          {/* Other Blogs */}
          {sortedBlogs.length > 1 && (
            <>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-5 text-right text-gray-800">
                سایر بلاگ‌های این دسته‌بندی
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedBlogs.slice(1).map((blog) => (
                  <Link
                    key={blog.id}
                    href={`/support/blog/${blogCategory}/${blog.slug}`}
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
            </>
          )}

          {/* No Blogs Found */}
          {sortedBlogs.length === 0 && (
            <p className="text-center text-gray-600 text-xl mt-10">
              متأسفانه بلاگی در این دسته‌بندی وجود ندارد.
            </p>
          )}
        </div>
      </Suspense>
    </>
  );
};

export default BlogCategoryPage;
