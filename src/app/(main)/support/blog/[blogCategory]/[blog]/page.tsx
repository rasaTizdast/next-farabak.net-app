import { promises as fs } from "fs";
import path from "path";
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

export async function generateMetadata({
  params,
}: {
  params: { blog: string };
}) {
  const content = await fs.readFile(
    path.join(process.cwd(), "src/blogs", `${params.blog}.mdx`),
    "utf-8"
  );

  const { frontmatter } = await compileMDX<Frontmatter>({
    source: content,
    options: { parseFrontmatter: true },
    components,
  });

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    keywords: frontmatter.keywords,
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.description,
      images: [frontmatter.image],
    },
  };
}

export default async function BlogPage({
  params,
}: {
  params: { blog: string };
}) {
  const content = await fs.readFile(
    path.join(process.cwd(), "src/blogs", `${params.blog}.mdx`),
    "utf-8"
  );

  const { frontmatter, content: mdxContent } = await compileMDX<Frontmatter>({
    source: content,
    options: { parseFrontmatter: true },
    components,
  });

  const readingTime = calculateReadingTime(content);

  return (
    <>
      <Breadcrumb breadcrumbs={["/", "/support", "/support/blog"]} />

      <article className="max-w-[1580px] mt-5 mx-auto bg-gray-200 p-5 sm:p-10 rounded-lg">
        <header className="mb-8">
          <H1>{frontmatter.title}</H1>
          <CustomImage
            width={1080}
            height={720}
            src={frontmatter.image}
            alt={frontmatter.title}
          />
          <div
            className="flex items-center gap-3 text-gray-600 mb-4 p-2 bg-gray-100 rounded-lg w-full mobile:w-fit justify-between text-xs mobile:text-sm md:text-base"
            aria-label="Blog metadata"
          >
            <span>{frontmatter.author}</span>
            <span>•</span>
            <time>{new Date(frontmatter.date).toLocaleDateString("fa")}</time>
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
            headline: frontmatter.title,
            author: {
              "@type": "Person",
              name: frontmatter.author,
            },
            datePublished: frontmatter.date,
            publisher: {
              "@type": "Organization",
              name: "Farabak",
            },
            mainEntityOfPage: {
              "@type": "WebPage",
              "@id": "",
            },
            description: frontmatter.description,
            image: frontmatter.image,
            articleBody: content,
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
