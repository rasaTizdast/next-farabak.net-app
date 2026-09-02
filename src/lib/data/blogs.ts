import { Prisma } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/prisma";

import { TAGS } from "./tags";

const BLOG_LIST_INCLUDE = {
  BlogCategories: {
    include: {
      Categories: true,
    },
  },
  Comments: true,
  Likes: true,
} as const;

type BlogWithRelations = Prisma.BlogsGetPayload<{ include: typeof BLOG_LIST_INCLUDE }>;

export interface BlogListCategory {
  name: string | null;
  slug: string | null;
}

export interface BlogListItem {
  id: number;
  title: string;
  SEO_Title: string;
  slug: string;
  image: string;
  image_alt: string;
  created_at: string | null;
  status: string;
  views_count: number;
  content: string;
  author: string | null;
  SEO_description: string;
  categories: BlogListCategory[];
  comments: number;
  likes: number;
}

export interface BlogsResult {
  blogs: BlogListItem[];
}

function formatBlogListItem(blog: BlogWithRelations): BlogListItem {
  return {
    id: blog.id,
    title: blog.title,
    SEO_Title: blog.SEO_Title,
    slug: blog.slug,
    image: blog.image_URL,
    image_alt: blog.image_alt,
    created_at: blog.created_at,
    status: blog.status,
    views_count: blog.views_count,
    content: blog.content,
    author: blog.author,
    SEO_description: blog.SEO_description,
    categories: blog.BlogCategories.map((blogCategory) => ({
      name: blogCategory.Categories.name,
      slug: blogCategory.Categories.slug,
    })),
    comments: blog.Comments.length,
    likes: blog.Likes.length,
  };
}

// ---------------------------------------------------------------------------
// /api/blogs
// ---------------------------------------------------------------------------

async function queryBlogs(): Promise<BlogsResult> {
  const blogs = await prisma.blogs.findMany({
    where: {
      status: "Published",
      QrCode_key: null,
    },
    include: BLOG_LIST_INCLUDE,
    orderBy: {
      created_at: "desc",
    },
  });

  return { blogs: blogs.map(formatBlogListItem) };
}

export async function getBlogs(): Promise<BlogsResult> {
  "use cache";
  cacheTag(TAGS.blogs);
  cacheLife("minutes");

  return queryBlogs();
}

// ---------------------------------------------------------------------------
// /api/blogs/category/:categorySlug
// ---------------------------------------------------------------------------

async function queryBlogsByCategory(categorySlug: string): Promise<BlogsResult> {
  const blogs = await prisma.blogs.findMany({
    where: {
      status: "Published",
      QrCode_key: null,
      BlogCategories: {
        some: {
          Categories: {
            slug: categorySlug,
          },
        },
      },
    },
    include: BLOG_LIST_INCLUDE,
    orderBy: {
      created_at: "desc",
    },
  });

  return { blogs: blogs.map(formatBlogListItem) };
}

export async function getBlogsByCategory(categorySlug: string): Promise<BlogsResult> {
  "use cache";
  cacheTag(TAGS.blogs);
  cacheLife("minutes");

  return queryBlogsByCategory(categorySlug);
}

// ---------------------------------------------------------------------------
// /api/blogs/:slug
// ---------------------------------------------------------------------------

const BLOG_DETAIL_INCLUDE = {
  BlogCategories: {
    include: {
      Categories: true,
    },
  },
  Comments: true,
  Likes: true,
  BlogFAQs: {
    where: { available: true },
    orderBy: { order: "asc" },
  },
} as const;

type BlogDetailRow = Prisma.BlogsGetPayload<{ include: typeof BLOG_DETAIL_INCLUDE }>;

export interface BlogDetailData {
  blog: {
    id: number;
    title: string;
    SEO_Title: string;
    slug: string;
    created_at: string | null;
    status: string;
    views_count: number;
    content: string;
    author: string | null;
    SEO_description: string;
    image_URL: string;
    image_alt: string;
    QrCode_key: string | null;
    QrCode_expiryDays: string | null;
  };
  categories: { id: number; name: string | null; slug: string | null }[];
  comments: { id: number; content: string; created_at: string | null }[];
  likes: number;
  media: { id: number; media_type: string; media_URL: string; media_alt: string | null }[];
  faqs: { id: number; question: string; answer: string; order: number }[];
}

async function queryBlogBySlug(slug: string): Promise<BlogDetailData | null> {
  const blog: BlogDetailRow | null = await prisma.blogs.findUnique({
    where: { slug, status: "Published" },
    include: BLOG_DETAIL_INCLUDE,
  });

  if (!blog) {
    return null;
  }

  const media = await prisma.media.findMany({
    where: { blog_id: blog.id },
  });

  return {
    blog: {
      id: blog.id,
      title: blog.title,
      SEO_Title: blog.SEO_Title,
      slug: blog.slug,
      created_at: blog.created_at,
      status: blog.status,
      views_count: blog.views_count,
      content: blog.content,
      author: blog.author,
      SEO_description: blog.SEO_description,
      image_URL: blog.image_URL,
      image_alt: blog.image_alt,
      QrCode_key: blog.QrCode_key,
      QrCode_expiryDays: blog.QrCode_expiryDays,
    },
    categories: blog.BlogCategories.map((category) => ({
      id: category.Categories.id,
      name: category.Categories.name,
      slug: category.Categories.slug,
    })),
    comments: blog.Comments.map((comment) => ({
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
    })),
    likes: blog.Likes.length,
    media: media.map((item) => ({
      id: item.id,
      media_type: item.media_type,
      media_URL: item.media_URL,
      media_alt: item.media_alt,
    })),
    faqs: blog.BlogFAQs.map((faq) => ({
      id: faq.id,
      question: faq.question,
      answer: faq.answer,
      order: faq.order,
    })),
  };
}

export async function getBlogBySlug(slug: string): Promise<BlogDetailData | null> {
  "use cache";
  cacheTag(TAGS.blogs);
  cacheLife("minutes");

  return queryBlogBySlug(slug);
}
