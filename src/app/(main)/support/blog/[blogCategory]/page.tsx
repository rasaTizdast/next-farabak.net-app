import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import BlogCategoryNav from "@/app/(main)/support/blog/_components/BlogCategoryNav";
import { ActionLink } from "@/components/public/ActionLink";
import BlogCover from "@/components/public/BlogCover";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicShell } from "@/components/public/PublicShell";
import { getBlogsByCategory } from "@/lib/data/blogs";

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
        robots: { index: false, follow: true },
      };
    }

    return {
      title: `مقالات ${getCategoryName(data.blogs, params.blogCategory)} | فرابک`,
      description: `مقالات آموزشی فرابک درباره ${getCategoryName(data.blogs, params.blogCategory)}.`,
    };
  } catch {
    return {
      title: "صفحه یافت نشد | فرابک",
      description: "صفحه مورد نظر یافت نشد",
      robots: { index: false, follow: true },
    };
  }
}

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
  author: string;
  SEO_description: string;
  image: string;
  image_alt: string;
  categories: BlogCategory[];
  comments: number;
  likes: number;
};

type Blogs = { blogs: Blog[] };

const getCategoryName = (blogs: Blog[], categorySlug: string) =>
  blogs
    .find((blog) => blog.categories.some((category) => category.slug === categorySlug))
    ?.categories.find((category) => category.slug === categorySlug)?.name ??
  categorySlug.replace(/-/g, " ");

const getBlogHref = (blog: Blog, categorySlug: string) =>
  `/support/blog/${categorySlug}/${blog.slug}`;

const CategoryContent = ({ blogs, categorySlug }: { blogs: Blog[]; categorySlug: string }) => {
  const [featuredBlog, ...otherBlogs] = blogs;
  const categories = Array.from(
    new Map(
      blogs
        .flatMap((blog) => blog.categories)
        .filter((category) => category.slug)
        .map((category) => [category.slug, category])
    ).values()
  );
  const categoryName = getCategoryName(blogs, categorySlug);

  return (
    <PublicShell className="pb-16">
      <PageIntro
        eyebrow="آرشیو مقالات"
        title={categoryName}
        description="یادداشت‌ها و آموزش‌های مرتبط با این دسته‌بندی را یکجا بخوانید و برای مطالعه جزئیات هر موضوع وارد صفحه مقاله شوید."
        actions={
          <ActionLink href="/support/blog" variant="secondary">
            بازگشت به همه مقالات <ArrowLeft aria-hidden="true" className="size-4" />
          </ActionLink>
        }
      />

      <section aria-label="دسته‌بندی مقالات" className="mb-8">
        <BlogCategoryNav categories={categories} currentSlug={categorySlug} />
      </section>

      <section aria-labelledby="category-feature-heading">
        <div className="mb-4">
          <p className="text-sm font-semibold text-(--farabak-action-blue)">آخرین نوشته</p>
          <h2
            id="category-feature-heading"
            className="mt-2 text-2xl font-bold text-(--farabak-ink-deep) md:text-3xl"
          >
            منتخب این دسته‌بندی
          </h2>
        </div>
        <Link
          href={getBlogHref(featuredBlog, categorySlug)}
          className="group grid overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.06)] focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none md:grid-cols-[1.15fr_0.85fr]"
        >
          <div className="relative aspect-video overflow-hidden md:aspect-auto md:min-h-96">
            <BlogCover
              src={
                featuredBlog.image ? `${process.env.LIARA_BUCKET_URL}/${featuredBlog.image}` : null
              }
              alt={featuredBlog.image_alt}
              width={1920}
              height={1080}
              priority
              sizes="(min-width: 768px) 58vw, 100vw"
              className="size-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
          <div className="flex flex-col justify-center p-6 md:p-10">
            <h3 className="text-2xl leading-tight font-bold text-(--farabak-ink-deep) md:text-3xl">
              {featuredBlog.title}
            </h3>
            <p className="mt-4 text-sm text-(--farabak-ink-muted)">
              <time dateTime={featuredBlog.created_at}>
                {new Date(featuredBlog.created_at).toLocaleDateString("fa-IR")}
              </time>
            </p>
            <span className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-(--farabak-action-blue)">
              مطالعه مقاله <ArrowLeft aria-hidden="true" className="size-4" />
            </span>
          </div>
        </Link>
      </section>

      {otherBlogs.length > 0 ? (
        <section aria-labelledby="category-articles-heading" className="mt-12">
          <div className="mb-5">
            <p className="text-sm font-semibold text-(--farabak-action-blue)">آرشیو</p>
            <h2
              id="category-articles-heading"
              className="mt-2 text-2xl font-bold text-(--farabak-ink-deep) md:text-3xl"
            >
              سایر مقالات این دسته‌بندی
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherBlogs.map((blog) => (
              <Link
                key={blog.id}
                href={getBlogHref(blog, categorySlug)}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_18px_50px_rgba(15,23,42,0.05)] transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-1 hover:border-(--farabak-action-blue)/40 hover:shadow-[0_22px_60px_rgba(15,23,42,0.1)] focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none"
              >
                <div className="relative aspect-video overflow-hidden">
                  <BlogCover
                    src={blog.image ? `${process.env.LIARA_BUCKET_URL}/${blog.image}` : null}
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

const BlogCategoryPage = async (props: { params: Promise<{ blogCategory: string }> }) => {
  const params = await props.params;
  let blogData: Blogs | null = null;

  try {
    blogData = (await getBlogsByCategory(params.blogCategory)) as Blogs;
  } catch {
    notFound();
  }

  if (!blogData?.blogs?.length) notFound();

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const blogIndexUrl = `${siteUrl}/support/blog`;
  const categoryUrl = `${blogIndexUrl}/${params.blogCategory}`;
  const categoryName = getCategoryName(blogData.blogs, params.blogCategory);

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
            image: blog.image ? `${process.env.LIARA_BUCKET_URL}/${blog.image}` : undefined,
            author: { "@type": "Person", name: blog.author },
          },
        },
      ];
    })
    .map((listItem, index) => ({ ...listItem, position: index + 1 }));

  const structuredData = serializeJsonLd({
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["WebPage", "CollectionPage"],
        "@id": `${categoryUrl}#collection`,
        url: categoryUrl,
        name: `مقالات دسته‌بندی ${categoryName} | فرابک`,
        description: `جدیدترین مقالات و آموزش‌های بلاگ فرابک درباره ${categoryName}.`,
        inLanguage: "fa-IR",
        isPartOf: { "@id": `${blogIndexUrl}#blog` },
        mainEntity: { "@id": `${categoryUrl}#itemlist` },
      },
      { "@type": "ItemList", "@id": `${categoryUrl}#itemlist`, itemListElement: categoryItemList },
    ],
  });

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData }} />
      <CategoryContent blogs={blogData.blogs} categorySlug={params.blogCategory} />
    </>
  );
};

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default BlogCategoryPage;
