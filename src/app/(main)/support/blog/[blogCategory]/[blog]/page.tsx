import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";
import { notFound } from "next/navigation";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import BlogFaqAccordion from "@/components/BlogFaqAccordion";
import { getBlogBySlug, type BlogDetailData } from "@/lib/data/blogs";
import { cn } from "@/lib/utils";

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

  return (
    <div className="w-full max-w-[1580px]">
      <Breadcrumb breadcrumbs={["/", "/support", "/support/blog"]} />

      <article className={cn("bg-background mt-5 w-full rounded-lg p-5 sm:p-10")}>
        <header className={cn("mb-8")}>
          <h1 className={cn("mb-8 text-2xl font-bold sm:text-4xl")}>{blog.title}</h1>
          <Image
            src={`${process.env.LIARA_BUCKET_URL}/${blog.image_URL}`}
            alt={blog.image_alt}
            className={cn("mx-auto mb-6 w-full rounded-lg object-cover lg:w-3/5")}
            width={1200}
            height={630}
            quality={75}
            sizes="(min-width: 1400px) calc(60vw - 15rem), (min-width: 1200px) calc(60vw - 10rem), (min-width: 1024px) calc(60vw - 8rem), (min-width: 768px) calc(100vw - 11rem), (min-width: 640px) calc(100vw - 8rem), calc(100vw - 6rem)"
          />
          <div className={cn("scrollbar-hide bg-background mb-4 overflow-x-auto rounded-lg p-2")}>
            <div
              className={cn(
                "mobile:text-base text-muted-foreground flex items-center gap-3 text-xs whitespace-nowrap"
              )}
            >
              <span>{blog.author}</span>
              <span>•</span>
              <time>
                {blog.created_at ? new Date(blog.created_at).toLocaleDateString("fa") : ""}
              </time>
              <span>•</span>
              <span>{readingTime} دقیقه مطالعه</span>
            </div>
          </div>
        </header>

        <div
          className={cn(
            "prose-view max-w-none [&_.w-1\/2]:mx-auto [&_.w-1\/2]:w-1/2 [&_.w-1\/3]:mx-auto [&_.w-1\/3]:w-1/3 [&_.w-full]:w-full [&_img]:h-auto [&_img]:max-w-full"
          )}
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(processContentWithImageUrls(blog.content), {
              ADD_TAGS: ["Image", "video", "source"],
              ADD_ATTR: ["controls", "class"],
            }),
          }}
        />
      </article>

      {/* FAQ Section */}
      {faqs && faqs.length > 0 && (
        <section className={cn("bg-background mt-8 w-full rounded-lg p-5 shadow-sm sm:p-10")}>
          <BlogFaqAccordion
            faqs={faqs}
            blogTitle={blog.title}
            blogSlug={params.blog}
            description={`پاسخ سوالات رایج درباره "${blog.title}"`}
          />
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: blogJsonLd }} />
      {faqJsonLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJsonLd }} />
      )}
    </div>
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
