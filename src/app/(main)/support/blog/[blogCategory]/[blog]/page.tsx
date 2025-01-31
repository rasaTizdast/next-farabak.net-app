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
  };
  categories: { name: string; slug: string }[];
  comments: { content: string; created_at: string }[];
  likes: number;
  media: { media_URL: string; media_alt: string }[];
}

const getBlog = async (slug: string): Promise<BlogResponse | null> => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/blogs/${slug}`
    );

    if (!res.ok) {
      console.error(`Failed to fetch blog: ${res.statusText}`);
      return null;
    }

    return (await res.json()) as BlogResponse;
  } catch (error) {
    console.error("Error fetching blog:", error);
    return null;
  }
};

export async function generateMetadata({
  params,
}: {
  params: { blog: string };
}) {
  const content = await getBlog(params.blog);

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

// BlogPage.tsx
export default async function BlogPage({
  params,
}: {
  params: { blog: string };
}) {
  const blogResponse = await getBlog(params.blog);

  if (!blogResponse) {
    notFound();
  }

  const { blog } = blogResponse;

  console.log(blog);

  const readingTime = calculateReadingTime(blog.content);

  // Add this utility function above your component
  const processContentWithImageUrls = (content: string) => {
    const baseUrl = process.env.LIARA_BUCKET_URL || "";
    // Add the base URL to all image src attributes
    return content.replace(
      /<Image([^>]*)src="([^"]*)"([^>]*)/g,
      (match, before, src, after) => {
        // Skip if already has base URL
        if (src.startsWith(baseUrl)) return match;
        return `<Image${before}src="${baseUrl}/${src}"${after}`;
      }
    );
  };

  return (
    <>
      <Breadcrumb breadcrumbs={["/", "/support", "/support/blog"]} />

      <article className="max-w-[1580px] mt-5 mx-auto bg-gray-200 p-5 sm:p-10 rounded-lg">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-8">{blog.title}</h1>
          <Image
            src={`${process.env.LIARA_BUCKET_URL}/blogImages/${blog.image_URL}`}
            alt={blog.image_alt}
            className="rounded-lg w-full object-cover mb-6"
            width={1200}
            height={630}
            quality={100}
          />
          <div className="flex items-center gap-3 text-gray-600 mb-4 p-2 bg-gray-100 rounded-lg">
            <span>{blog.author}</span>
            <span>•</span>
            <time>{new Date(blog.created_at).toLocaleDateString("fa")}</time>
            <span>•</span>
            <span>{readingTime} دقیقه مطالعه</span>
          </div>
        </header>

        {/* Render editor content directly */}
        <div
          className="prose-view max-w-none"
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
  // Remove HTML tags while preserving Persian/Arabic text
  const text = content.replace(/<[^>]*>/g, " ");

  // Improved cleaning for Persian/Arabic text
  const cleanText = text
    // Preserve Persian/Arabic characters and numbers
    .replace(
      /[^\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF0-9\s]/g,
      " "
    )
    // Normalize whitespace and remove zero-width characters
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  // More accurate word count for Persian/Arabic text
  const words = cleanText.split(/\s+/).filter((word) => word.length > 0).length;

  // Adjusted reading speed for Persian text (studies show 150-200 wpm)
  const wordsPerMinute = 250; // Average for Persian technical content

  // Calculate reading time with minimum 1 minute
  const readingTime = Math.max(1, Math.ceil(words / wordsPerMinute));

  return readingTime;
}
