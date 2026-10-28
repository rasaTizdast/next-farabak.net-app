import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogCategoryNav from "@/app/(main)/support/blog/_components/BlogCategoryNav";
import { ActionLink } from "@/components/public/ActionLink";
import BlogCover from "@/components/public/BlogCover";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicShell } from "@/components/public/PublicShell";
import { getBlogCategories } from "@/lib/data/blogCategories";
import { getBlogs } from "@/lib/data/blogs";

export const metadata: Metadata = {
  title: "بلاگ آموزشی فرابک | مقالات امنیتی",
  description:
    "مقالات تخصصی درباره خرید دوربین مداربسته، نصب محصولات بلک مجیک و نکات نگهداری سیستم‌های امنیتی. محتوای مفید و به‌روز از کارشناسان فرابک.",
  robots: {
    index: true,
    follow: true,
  },
};

type BlogCategory = {
  id: number;
  name: string | null;
  slug: string | null;
};

type Blog = {
  id: number;
  title: string;
  SEO_Title: string;
  slug: string;
  created_at: string;
  status: string;
  views_count: number;
  content: string;
  author: string | null;
  SEO_description: string;
  image: string;
  image_alt: string;
  categories: BlogCategory[];
  comments: number;
  likes: number;
};

type Blogs = {
  blogs: Blog[];
};

const bucketUrl = () => process.env.LIARA_BUCKET_URL || "";

const getBlogHref = (blog: Blog) => {
  const categorySlug = blog.categories.find((category) => category.slug)?.slug;
  return categorySlug ? `/support/blog/${categorySlug}/${blog.slug}` : "/support/blog";
};

const BlogLandingContent = ({
  blogs,
  categories,
}: {
  blogs: Blog[];
  categories: BlogCategory[];
}) => {
  const [featuredBlog, ...otherBlogs] = blogs;

  return (
    <PublicShell className="pb-16">
      <PageIntro
        eyebrow="دانش و تجربه فرابک"
        title="راهنمایی برای تصمیم‌های دقیق‌تر"
        description="از انتخاب تجهیزات تا نگهداری و استفاده، یادداشت‌ها و آموزش‌های کاربردی تیم فرابک را در یک مسیر خوانا دنبال کنید."
        actions={
          <ActionLink href="/support/faq" variant="secondary">
            سوالات متداول <ArrowLeft aria-hidden="true" className="size-4" />
          </ActionLink>
        }
      />

      <section aria-labelledby="blog-categories-heading" className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 id="blog-categories-heading" className="text-xl font-bold text-(--farabak-ink-deep)">
            دسته‌بندی مقالات
          </h2>
          <span className="text-sm text-(--farabak-ink-muted)">{blogs.length} مقاله</span>
        </div>
        <BlogCategoryNav categories={categories} />
      </section>

      <section aria-labelledby="featured-article-heading">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-(--farabak-action-blue)">پیشنهاد امروز</p>
            <h2
              id="featured-article-heading"
              className="mt-2 text-2xl font-bold text-(--farabak-ink-deep) md:text-3xl"
            >
              مقاله منتخب
            </h2>
          </div>
          <Link
            href="#article-grid"
            className="hidden text-sm font-semibold text-(--farabak-action-blue) underline-offset-4 hover:underline md:inline-flex"
          >
            همه مقالات
          </Link>
        </div>

        <Link
          href={getBlogHref(featuredBlog)}
          className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none md:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="relative aspect-video overflow-hidden md:aspect-auto md:min-h-96">
            <BlogCover
              src={featuredBlog.image ? `${bucketUrl()}/${featuredBlog.image}` : null}
              alt={featuredBlog.image_alt}
              width={1920}
              height={1080}
              priority
              sizes="(min-width: 768px) 58vw, 100vw"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-10">
            <span className="text-sm font-semibold text-(--farabak-action-blue)">
              جدیدترین مقاله
            </span>
            <h3 className="mt-4 text-2xl leading-tight font-bold text-(--farabak-ink-deep) md:text-3xl">
              {featuredBlog.title}
            </h3>
            <p className="mt-4 text-sm text-(--farabak-ink-muted)">
              <time dateTime={featuredBlog.created_at}>
                {new Date(featuredBlog.created_at).toLocaleDateString("fa-IR")}
              </time>
              {featuredBlog.author ? ` · ${featuredBlog.author}` : ""}
            </p>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-(--farabak-action-blue)">
              مطالعه مقاله <ArrowLeft aria-hidden="true" className="size-4" />
            </span>
          </div>
        </Link>
      </section>

      {otherBlogs.length > 0 ? (
        <section
          id="article-grid"
          aria-labelledby="other-articles-heading"
          className="mt-12 scroll-mt-28"
        >
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-(--farabak-action-blue)">آرشیو آموزشی</p>
              <h2
                id="other-articles-heading"
                className="mt-2 text-2xl font-bold text-(--farabak-ink-deep) md:text-3xl"
              >
                سایر مقالات
              </h2>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherBlogs.map((blog) => (
              <Link
                key={blog.id}
                href={getBlogHref(blog)}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-(--farabak-action-blue)/40 hover:shadow-[0_22px_60px_rgba(15,23,42,0.1)] focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <div className="relative aspect-video overflow-hidden">
                  <BlogCover
                    src={blog.image ? `${bucketUrl()}/${blog.image}` : null}
                    alt={blog.image_alt}
                    width={960}
                    height={540}
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                  />
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg leading-8 font-bold text-(--farabak-ink-deep)">
                    {blog.title}
                  </h3>
                  <p className="mt-auto pt-4 text-sm text-(--farabak-ink-muted)">
                    <time dateTime={blog.created_at}>
                      {new Date(blog.created_at).toLocaleDateString("fa-IR")}
                    </time>
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </PublicShell>
  );
};

const BlogLandingPage = async () => {
  let blogData: Blogs | null = null;
  let categoryData: BlogCategory[] = [];

  try {
    blogData = (await getBlogs()) as Blogs;
  } catch (error) {
    console.error("Error fetching blog data:", error);
  }

  try {
    categoryData = await getBlogCategories();
  } catch (error) {
    console.error("Error fetching category data:", error);
  }

  if (!blogData?.blogs?.length) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const imageBaseUrl = process.env.LIARA_BUCKET_URL || "";
  const blogIndexUrl = `${siteUrl}/support/blog`;

  const blogItemList = blogData.blogs
    .flatMap((blog) => {
      const categorySlug = blog.categories?.[0]?.slug;
      if (!categorySlug) return [];
      const postUrl = `${blogIndexUrl}/${categorySlug}/${blog.slug}`;
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
            image: blog.image ? `${imageBaseUrl}/${blog.image}` : undefined,
            author: { "@type": "Person", name: blog.author },
          },
        },
      ];
    })
    .map((listItem, index) => ({ ...listItem, position: index + 1 }));

  const blogStructuredData = serializeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${blogIndexUrl}#webpage`,
        url: blogIndexUrl,
        name: "بلاگ آموزشی فرابک | مقالات امنیتی",
        description: metadata.description,
        inLanguage: "fa-IR",
        isPartOf: { "@id": `${blogIndexUrl}#blog` },
        mainEntity: { "@id": `${blogIndexUrl}#itemlist` },
      },
      {
        "@type": "Blog",
        "@id": `${blogIndexUrl}#blog`,
        name: "وبلاگ فرابک",
        url: blogIndexUrl,
        description: metadata.description,
        inLanguage: "fa-IR",
        publisher: {
          "@type": "Organization",
          name: "فرابک",
          url: siteUrl || undefined,
          logo: { "@type": "ImageObject", url: `${siteUrl}/Farabak_Logo.webp` },
        },
      },
      { "@type": "ItemList", "@id": `${blogIndexUrl}#itemlist`, itemListElement: blogItemList },
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: blogStructuredData }} />
      <BlogLandingContent blogs={blogData.blogs} categories={categoryData} />
    </>
  );
};

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default BlogLandingPage;
