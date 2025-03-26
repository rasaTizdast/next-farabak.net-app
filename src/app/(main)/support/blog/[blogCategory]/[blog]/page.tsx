import Script from "next/script";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { notFound } from "next/navigation";
import Image from "next/image";

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
}

const getBlog = async (
  slug: string,
  searchParams: { key?: string },
  isAdmin: boolean = false
): Promise<BlogResponse | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/${slug}`
    );

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

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { blog: string };
  searchParams: { key?: string };
}) {
  const content = await getBlog(params.blog, searchParams);

  if (!content) {
    return {
      title: "مقاله‌ای یافت نشد",
      description: "با این اطلاعات، مقاله یافت نشد!",
    };
  }

  return {
    title: content.blog.SEO_Title,
    description: content.blog.SEO_description,
  };
}

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: { blog: string };
  searchParams: { key?: string };
}) {
  const blogResponse = await getBlog(params.blog, searchParams);

  if (!blogResponse) {
    notFound();
  }

  const { blog } = blogResponse;

  const readingTime = calculateReadingTime(blog.content);

  const processContentWithImageUrls = (content: string) => {
    const baseUrl = process.env.LIARA_BUCKET_URL || "";
    
    // First, handle src attribute to make sure URLs are correct
    let processedContent = content.replace(
      /<Image([^>]*)src="([^"]*)"([^>]*)/g,
      (match, before, src, after) => {
        if (src.startsWith(baseUrl)) return match;
        return `<Image${before}src="${baseUrl}/${src}"${after}`;
      }
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

      <article className="max-w-[1580px] w-full mt-5 mx-auto bg-gray-200 p-5 sm:p-10 rounded-lg">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-8">{blog.title}</h1>
          <Image
            src={`${process.env.LIARA_BUCKET_URL}/${blog.image_URL}`}
            alt={blog.image_alt}
            className="rounded-lg w-3/5 object-cover mb-6 mx-auto"
            width={1200}
            height={630}
            quality={100}
          />
          <div className="flex items-center justify-center mobile:justify-normal gap-3 text-gray-600 mb-4 p-2 bg-gray-100 rounded-lg text-xs mobile:text-base">
            <span>{blog.author}</span>
            <span>•</span>
            <time>{new Date(blog.created_at).toLocaleDateString("fa")}</time>
            <span>•</span>
            <span>{readingTime} دقیقه مطالعه</span>
          </div>
        </header>

        <div
          className="prose-view max-w-none [&_img]:max-w-full [&_img]:h-auto [&_.w-full]:w-full [&_.w-1\/2]:w-1/2 [&_.w-1\/2]:mx-auto [&_.w-1\/3]:w-1/3 [&_.w-1\/3]:mx-auto"
          dangerouslySetInnerHTML={{
            __html: processContentWithImageUrls(blog.content),
          }}
        />
      </article>

      <Script
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
    .replace(
      /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9\s]/g,
      " "
    )
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const words = cleanText.split(/\s+/).filter((word) => word.length > 0).length;
  const wordsPerMinute = 250;
  const readingTime = Math.max(1, Math.ceil(words / wordsPerMinute));
  return readingTime;
}
