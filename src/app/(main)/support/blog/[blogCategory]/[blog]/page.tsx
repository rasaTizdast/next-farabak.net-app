import { compileMDX } from "next-mdx-remote/rsc";
import {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  CustomImage,
  CustomLink,
  UnorderedList,
  OrderedList,
  ListItem,
  Paragraph,
  Section,
} from "@/app/_components/mdx/index";

import Script from "next/script";
import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import { notFound } from "next/navigation";

// Define the frontmatter type
interface Frontmatter {
  title: string;
  date: string;
  author: string;
  description: string;
  image: string;
  category: string;
  tags: string[];
  keywords: string[];
}

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

// Custom components mapping for MDX
const components = {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  Paragraph,
  CustomImage,
  CustomLink,
  UnorderedList,
  OrderedList,
  ListItem,
  Section,
};

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

  const { content: mdxContent } = await compileMDX<Frontmatter>({
    source: blog.content,
    options: { parseFrontmatter: true },
    components,
  });

  const readingTime = calculateReadingTime(blog.content);

  return (
    <>
      <Breadcrumb breadcrumbs={["/", "/support", "/support/blog"]} />

      <article className="max-w-[1580px] mt-5 mx-auto bg-gray-200 p-5 sm:p-10 rounded-lg">
        <header className="mb-8">
          <H1>{blog.title}</H1>
          <CustomImage
            width={1080}
            height={720}
            src={`${process.env.LIARA_BUCKET_URL}/blogImages/${blog.image_URL}`}
            alt={blog.image_alt}
          />
          <div
            className="flex items-center gap-3 text-gray-600 mb-4 p-2 bg-gray-100 rounded-lg w-full mobile:w-fit justify-between text-xs mobile:text-sm md:text-base"
            aria-label="Blog metadata"
          >
            <span>{blog.author}</span>
            <span>•</span>
            <time>{new Date(blog.created_at).toLocaleDateString("fa")}</time>
            <span>•</span>
            <div className="flex items-center gap-1">
              <span>{readingTime} دقیقه مطالعه</span>
            </div>
          </div>
        </header>
        {mdxContent}
      </article>
      <Script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: blog.title,
            author: {
              "@type": "Person",
              name: blog.author,
            },
            datePublished: blog.created_at,
            publisher: {
              "@type": "Organization",
              name: "Farabak",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "",
            },
            description: blog.description,
            image: blog.image_URL,
            articleBody: blog.content,
          }),
        }}
      />
    </>
  );
}

function calculateReadingTime(content: string): number {
  // Remove HTML tags
  const text = content.replace(/<[^>]*>/g, "");

  // Remove special characters and extra spaces
  const cleanText = text.replace(/[^\w\s]/g, "").trim();

  // Count words (including Persian/Arabic text)
  const words = cleanText.split(/\s+/).length;

  // Average reading speed (words per minute)
  // Adjust this number based on your content (Persian/English mix)
  const wordsPerMinute = 200;

  // Calculate reading time
  const readingTime = Math.ceil(words / wordsPerMinute);

  return readingTime;
}
