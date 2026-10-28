import DOMPurify from "isomorphic-dompurify";
import { ArrowLeft } from "lucide-react";
import { io } from "next/cache";
import { notFound } from "next/navigation";

import BlogFaqAccordion from "@/components/BlogFaqAccordion";
import { ActionLink } from "@/components/public/ActionLink";
import BlogCover from "@/components/public/BlogCover";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicShell } from "@/components/public/PublicShell";
import { getBlogBySlug, type BlogDetailData } from "@/lib/data/blogs";

import { addArticleHeadingAnchors, extractArticleHeadings } from "../../_components/blog-helpers";

function processContentWithImageUrls(content: string) {
  const baseUrl = process.env.LIARA_BUCKET_URL || "";

  // First, handle src attribute to make sure URLs are correct for images
  let processedContent = content.replace(
    /<Image([^>]*)src="([^"]*)"([^>]*)/g,
    (match, before, src, after) => {
      if (src.startsWith(baseUrl)) return match;
      return `<Image${before}src="${baseUrl}/${src}"${after}`;
    }
  );

  // Handle video sources inside regular video tags
  processedContent = processedContent.replace(
    /<video([^>]*)src="([^"]*)"([^>]*)/g,
    (match, before, src, after) => {
      if (src.startsWith(baseUrl) || src.startsWith("http")) return match;
      return `<video${before}src="${baseUrl}/${src}"${after}`;
    }
  );

  // Process TipTap video nodes - convert them to standard HTML5 video tags
  processedContent = processedContent.replace(
    /<div data-type="video"[^>]*>([\s\S]*?)<\/div>/g,
    (match) => {
      // Extract src attribute from the video tag inside the div
      const srcMatch = match.match(/src="([^"]*)"/);
      if (srcMatch && srcMatch[1]) {
        const src = srcMatch[1];
        const fullSrc =
          src.startsWith(baseUrl) || src.startsWith("http") ? src : `${baseUrl}/${src}`;

        // Replace the entire div with a simple video element
        return `<video src="${fullSrc}" controls class="w-full max-w-4xl mx-auto rounded-md my-4"></video>`;
      }
      return match;
    }
  );

  // Ensure videos have controls
  processedContent = processedContent.replace(
    /<video(?![^>]*controls)([^>]*)/g,
    "<video$1 controls "
  );

  // Then handle the size classes. Make sure classes defined in the editor are preserved
  processedContent = processedContent.replace(
    /<Image([^>]*)className="([^"]*)"([^>]*)/g,
    (match, before, className, after) => {
      // Keep all existing classes and just make sure they're applied
      return `<Image${before}className="${className}"${after}`;
    }
  );

  // Finally, handle images that don't have className but do have width/height
  // This ensures older content or images without explicit size classes still respect dimensions
  processedContent = processedContent.replace(
    /<Image([^>]*)width=\{(\d+)\}([^>]*)height=\{(\d+)\}([^>]*?)(?!className)>/g,
    (match, before, width, middle, height, after) => {
      return `<Image${before}width={${width}}${middle}height={${height}}${after} className="max-w-full" style="--img-width:${width}px">`;
    }
  );

  // Handle images that have inline style with width attribute
  processedContent = processedContent.replace(
    /<Image([^>]*)style="width:(\d+)px"([^>]*)/g,
    (match, before, width, after) => {
      return `<Image${before}style="--img-width:${width}px"${after}`;
    }
  );

  return processedContent;
}

interface BlogResponse {
  blog: {
    title: string;
    content: string;
    author: string | null;
    created_at: string | null;
    description?: string;
    image_URL: string;
    image_alt: string;
    SEO_Title: string;
    SEO_description: string;
    QrCode_key?: string;
    QrCode_expiryDays?: Date;
  };
  categories: { name: string | null; slug: string | null }[];
  comments: { content: string; created_at: string | null }[];
  likes: number;
  media: { media_URL: string; media_alt: string | null }[];
  faqs: { id: number; question: string; answer: string; order: number }[];
}

function mapBlogResponse(data: BlogDetailData): BlogResponse {
  return {
    blog: {
      title: data.blog.title,
      content: data.blog.content,
      author: data.blog.author,
      created_at: data.blog.created_at,
      image_URL: data.blog.image_URL,
      image_alt: data.blog.image_alt,
      SEO_Title: data.blog.SEO_Title,
      SEO_description: data.blog.SEO_description,
      QrCode_key: data.blog.QrCode_key ?? undefined,
      QrCode_expiryDays: data.blog.QrCode_expiryDays
        ? new Date(data.blog.QrCode_expiryDays)
        : undefined,
    },
    categories: data.categories.map((category) => ({
      name: category.name,
      slug: category.slug,
    })),
    comments: data.comments.map((comment) => ({
      content: comment.content,
      created_at: comment.created_at,
    })),
    likes: data.likes,
    media: data.media.map((item) => ({
      media_URL: item.media_URL,
      media_alt: item.media_alt,
    })),
    faqs: data.faqs,
  };
}

const getBlog = async (
  slug: string,
  searchParams: { key?: string },
  isAdmin: boolean = false
): Promise<BlogResponse | null> => {
  let blogResponse: BlogResponse | null = null;

  try {
    const data = await getBlogBySlug(slug);
    if (!data) return null;
    blogResponse = mapBlogResponse(data);
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }

  if (isAdmin) {
    return blogResponse;
  }

  const { blog } = blogResponse;

  if (!blog) {
    notFound();
  }

  if (blog.QrCode_key) {
    const { key: urlKey } = searchParams;

    if (!urlKey || urlKey !== blog.QrCode_key) {
      notFound();
    }

    if (blog.QrCode_expiryDays) {
      await io();
      const expiryDate = new Date(blog.QrCode_expiryDays);
      if (new Date() > expiryDate) {
        notFound();
      }
    }
  }

  return blogResponse;
};

export async function generateMetadata(props: {
  params: Promise<{ blog: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const content = await getBlog(params.blog, searchParams);

  if (!content) {
    return {
      title: "مقاله‌ای یافت نشد",
      description: "با این اطلاعات، مقاله یافت نشد!",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  return {
    title: content.blog.SEO_Title,
    description: content.blog.SEO_description,
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function BlogPage(props: {
  params: Promise<{ blog: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const searchParams = await props.searchParams;
  const params = await props.params;
  const blogResponse = await getBlog(params.blog, searchParams);

  if (!blogResponse) {
    notFound();
  }

  const { blog, faqs } = blogResponse;

  const readingTime = calculateReadingTime(blog.content);
  const wordCount = countWords(blog.content);

  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
  const bucketUrl = process.env.LIARA_BUCKET_URL || "";
  const blogCategories = blogResponse.categories || [];
  const categorySlug = blogCategories[0]?.slug;
  const postUrl = categorySlug ? `${siteUrl}/support/blog/${categorySlug}/${params.blog}` : "";

  const blogJsonLd = serializeJsonLd({
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": postUrl ? `${postUrl}#blogPosting` : undefined,
    url: postUrl || undefined,
    headline: blog.title,
    description: blog.description,
    inLanguage: "fa-IR",
    datePublished: blog.created_at,
    dateModified: blog.created_at,
    wordCount,
    author: { "@type": "Person", name: blog.author },
    image: blog.image_URL ? `${bucketUrl}/${blog.image_URL}` : undefined,
    articleSection: blogCategories[0]?.name,
    keywords:
      blogCategories.length > 0 ? blogCategories.map((category) => category.name) : undefined,
    mainEntityOfPage: postUrl ? { "@type": "WebPage", "@id": postUrl } : undefined,
    publisher: {
      "@type": "Organization",
      name: "فرابک",
      url: siteUrl || undefined,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/Farabak_Logo.webp`,
      },
    },
    isPartOf: postUrl
      ? {
          "@type": "Blog",
          "@id": `${siteUrl}/support/blog`,
          name: "وبلاگ فرابک",
          url: `${siteUrl}/support/blog`,
        }
      : undefined,
  });

  const faqJsonLd =
    faqs && faqs.length > 0
      ? serializeJsonLd({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((faq) => ({
            "@type": "Question",
            name: faq.question,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.answer,
            },
          })),
        })
      : null;

  const articleHeadings = extractArticleHeadings(blog.content);
  const articleMarkup = addArticleHeadingAnchors(processContentWithImageUrls(blog.content));
  const imageSrc = blog.image_URL ? `${bucketUrl}/${blog.image_URL}` : null;

  return (
    <PublicShell className="pb-16">
      <PageIntro
        eyebrow={blogCategories[0]?.name ?? "مقاله آموزشی"}
        title={blog.title}
        description={blog.description ?? blog.SEO_description}
        actions={
          <ActionLink href="/support/blog" variant="secondary">
            بازگشت به آرشیو <ArrowLeft aria-hidden="true" className="size-4" />
          </ActionLink>
        }
      />

      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <article
          id="article-content"
          className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-8 md:p-10"
        >
          <header className="mb-8 border-b border-slate-100 pb-8">
            <BlogCover
              src={imageSrc}
              alt={blog.image_alt}
              className="mx-auto mb-6 aspect-video w-full rounded-xl object-cover"
              width={1200}
              height={630}
              sizes="(min-width: 1024px) 65vw, 100vw"
              priority
            />
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-(--farabak-ink-muted)">
              {blog.author ? <span>{blog.author}</span> : null}
              {blog.author && blog.created_at ? <span aria-hidden="true">•</span> : null}
              {blog.created_at ? (
                <time dateTime={blog.created_at}>
                  {new Date(blog.created_at).toLocaleDateString("fa-IR")}
                </time>
              ) : null}
              <span aria-hidden="true">•</span>
              <span>{readingTime} دقیقه مطالعه</span>
            </div>
          </header>

          {articleHeadings.length > 0 ? (
            <nav
              aria-label="فهرست مقاله"
              className="mb-8 rounded-xl bg-(--farabak-surface-blue) p-5 lg:hidden"
            >
              <p className="mb-3 text-sm font-bold text-(--farabak-ink-deep)">در این مقاله</p>
              <ol className="space-y-2 text-sm">
                {articleHeadings.map((heading) => (
                  <li key={heading.id} className={heading.level === 3 ? "pr-4" : undefined}>
                    <a
                      href={"#" + heading.id}
                      className="text-(--farabak-ink-muted) underline-offset-4 hover:text-(--farabak-action-blue) hover:underline"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}

          <div
            className="prose-view [&_.w-1\/2]:w-1\/2 [&_.w-1\/3]:w-1\/3 mx-auto max-w-3xl [&_.w-1\/2]:mx-auto [&_.w-1\/3]:mx-auto [&_.w-full]:w-full [&_h2]:scroll-mt-28 [&_h3]:scroll-mt-28 [&_img]:h-auto [&_img]:max-w-full"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(articleMarkup, {
                ADD_TAGS: ["Image", "video", "source"],
                ADD_ATTR: ["controls", "class", "id"],
              }),
            }}
          />
        </article>

        <aside className="sticky top-28 hidden space-y-4 lg:block">
          {articleHeadings.length > 0 ? (
            <nav
              aria-label="فهرست مقاله"
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)]"
            >
              <p className="mb-3 text-sm font-bold text-(--farabak-ink-deep)">در این مقاله</p>
              <ol className="space-y-3 text-sm">
                {articleHeadings.map((heading) => (
                  <li key={heading.id} className={heading.level === 3 ? "pr-4" : undefined}>
                    <a
                      href={"#" + heading.id}
                      className="text-(--farabak-ink-muted) underline-offset-4 hover:text-(--farabak-action-blue) hover:underline"
                    >
                      {heading.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          ) : null}
          <ActionLink
            href={categorySlug ? "/support/blog/" + categorySlug : "/support/blog"}
            variant="secondary"
            className="w-full"
          >
            مقالات مرتبط <ArrowLeft aria-hidden="true" className="size-4" />
          </ActionLink>
        </aside>
      </div>

      {faqs && faqs.length > 0 ? (
        <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.05)] sm:p-8">
          <BlogFaqAccordion
            faqs={faqs}
            blogTitle={blog.title}
            blogSlug={params.blog}
            description={`پاسخ سوالات رایج درباره "${blog.title}"`}
          />
        </section>
      ) : null}

      <section className="mt-8 grid gap-4 rounded-2xl bg-(--farabak-ink-deep) p-6 text-white md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div>
          <p className="text-sm font-semibold text-cyan-200">هنوز سوالی دارید؟</p>
          <h2 className="mt-2 text-2xl font-bold">کارشناسان فرابک راهنمایی‌تان می‌کنند</h2>
          <p className="mt-2 leading-8 text-slate-300">
            اگر در انتخاب یا استفاده از محصول نیاز به توضیح بیشتری دارید، با ما در ارتباط باشید.
          </p>
        </div>
        <ActionLink
          href="/contact-us"
          className="bg-white text-(--farabak-ink-deep) hover:bg-slate-100"
        >
          تماس با ما <ArrowLeft aria-hidden="true" className="size-4" />
        </ActionLink>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: blogJsonLd }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
      )}
    </PublicShell>
  );
}

function countWords(content: string): number {
  const text = content.replace(/<[^>]*>/g, " ");
  const cleanText = text
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9\s]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return cleanText.split(/\s+/).filter((word) => word.length > 0).length;
}

function calculateReadingTime(content: string): number {
  return Math.max(1, Math.ceil(countWords(content) / 250));
}

function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
