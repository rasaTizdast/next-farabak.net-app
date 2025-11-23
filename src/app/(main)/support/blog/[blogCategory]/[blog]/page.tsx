import Image from "next/image";
import { notFound } from "next/navigation";
import Script from "next/script";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import BlogFaqAccordion from "@/components/BlogFaqAccordion";

interface BlogResponse {
  blog: {
    title: string;
    content: string;
    author: string;
    created_at: string;
    description: string;
    image_URL: string;
    image_alt: string;
    SEO_Title: string;
    SEO_description: string;
    QrCode_key?: string;
    QrCode_expiryDays?: Date;
  };
  categories: { name: string; slug: string }[];
  comments: { content: string; created_at: string }[];
  likes: number;
  media: { media_URL: string; media_alt: string }[];
  faqs: { id: number; question: string; answer: string; order: number }[];
}

const getBlog = async (
  slug: string,
  searchParams: { key?: string },
  isAdmin: boolean = false
): Promise<BlogResponse | null> => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/${slug}`, {
      next: { revalidate: 60 }, // Optional: revalidate every 60 seconds for ISR
    });

    if (!res.ok) {
      console.error(`Failed to fetch blog: ${res.statusText}`);
      return null;
    }

    const blogResponse = (await res.json()) as BlogResponse;

    // Admin users can bypass all checks
    if (isAdmin) {
      return blogResponse;
    }

    const { blog } = blogResponse;

    // Check if the product data exists
    if (!blog) {
      notFound();
    }

    // Check QR code conditions
    if (blog.QrCode_key) {
      const { key: urlKey } = searchParams;

      // If there's no key in the URL or the key in the URL doesn't match the product's QR code key
      if (!urlKey || urlKey !== blog.QrCode_key) {
        notFound();
      }

      if (blog.QrCode_expiryDays) {
        // Check if the QR code has expired
        const expiryDate = new Date(blog.QrCode_expiryDays);
        if (new Date() > expiryDate) {
          notFound();
        }
      }
    }

    // If the key matches and the QR code is not expired, allow access
    return blogResponse;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
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

  const processContentWithImageUrls = (content: string) => {
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
  };

  return (
    <>
      <Breadcrumb breadcrumbs={["/", "/support", "/support/blog"]} />

      <article className="mx-auto mt-5 w-full max-w-[1580px] rounded-lg bg-gray-200 p-5 sm:p-10">
        <header className="mb-8">
          <h1 className="mb-8 text-2xl font-bold sm:text-4xl">{blog.title}</h1>
          <Image
            src={`${process.env.LIARA_BUCKET_URL}/${blog.image_URL}`}
            alt={blog.image_alt}
            className="mx-auto mb-6 w-full rounded-lg object-cover lg:w-3/5"
            width={1200}
            height={630}
            quality={100}
          />
          <div className="mb-4 flex items-center justify-center gap-3 rounded-lg bg-gray-100 p-2 text-xs text-gray-600 mobile:justify-normal mobile:text-base">
            <span>{blog.author}</span>
            <span>•</span>
            <time>{new Date(blog.created_at).toLocaleDateString("fa")}</time>
            <span>•</span>
            <span>{readingTime} دقیقه مطالعه</span>
          </div>
        </header>

        <div
          className="prose-view max-w-none [&_.w-1\/2]:mx-auto [&_.w-1\/2]:w-1/2 [&_.w-1\/3]:mx-auto [&_.w-1\/3]:w-1/3 [&_.w-full]:w-full [&_img]:h-auto [&_img]:max-w-full"
          dangerouslySetInnerHTML={{
            __html: processContentWithImageUrls(blog.content),
          }}
        />
      </article>

      {/* FAQ Section */}
      {faqs && faqs.length > 0 && (
        <section className="mx-auto mt-8 w-full max-w-[1580px] rounded-lg bg-white p-5 shadow-sm sm:p-10">
          <BlogFaqAccordion
            faqs={faqs}
            blogTitle={blog.title}
            blogSlug={params.blog}
            description={`پاسخ سوالات رایج درباره "${blog.title}"`}
          />
        </section>
      )}

      <Script
        id="blogContent"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: blog.title,
            author: { "@type": "Person", name: blog.author },
            datePublished: blog.created_at,
            publisher: { "@type": "Organization", name: "Farabak" },
            description: blog.description,
            image: blog.image_URL,
            articleBody: processContentWithImageUrls(blog.content),
          }),
        }}
      />
    </>
  );
}

function calculateReadingTime(content: string): number {
  const text = content.replace(/<[^>]*>/g, " ");
  const cleanText = text
    .replace(/[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9\s]/g, " ")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleanText.split(/\s+/).filter((word) => word.length > 0).length;
  const wordsPerMinute = 250;
  const readingTime = Math.max(1, Math.ceil(words / wordsPerMinute));
  return readingTime;
}
