import { cacheLife, cacheTag } from "next/cache";

import { getProjects, type ProjectListItem } from "@/lib/data/projects";
import { TAGS } from "@/lib/data/tags";
import { normalizeInternalLink, resolveHomepageImage } from "@/lib/homepage-proof";
import { prisma } from "@/lib/prisma";

export type ShowcaseItem = {
  id: number;
  title: string;
  desc: string;
  image: string;
  link: string;
};

export type HomepageData = {
  projects: ProjectListItem[];
  publishedProjectCount: number | null;
  products: ShowcaseItem[];
  blogs: HomepageBlogItem[];
  blogFeedStatus: "ready" | "unavailable";
};

export type HomepageBlogTopic = "xray" | "blackmagic" | "cctv" | "other";

export type HomepageBlogItem = {
  id: number;
  title: string;
  href: string;
  category: string;
  topic: HomepageBlogTopic;
  reasonToRead: string;
  image: string | null;
  imageAlt: string | null;
  date: string | null;
  description: string | null;
};

const BLOG_SELECT = {
  id: true,
  title: true,
  slug: true,
  image_URL: true,
  image_alt: true,
  created_at: true,
  SEO_description: true,
  BlogCategories: { select: { Categories: { select: { name: true, slug: true } } } },
} as const;

const BLOG_CANDIDATE_LIMIT = 120;
const BLOG_TOPIC_CANDIDATE_LIMIT = 24;

const BLOG_TOPIC_TERMS = {
  xray: ["x-ray", "xray", "hi-scan", "اسمیتس", "ایکس ری", "ایکس‌ری", "اشعه", "بازرسی بار"],
  blackmagic: ["blackmagic", "بلک مجیک", "بلک‌مجیک", "pyxis", "پایکسیس"],
  cctv: ["cctv", "reolink", "ریولینک", "دوربین مداربسته", "نظارت تصویری"],
} as const;

type BlogCardRecord = {
  id: number;
  title: string;
  slug: string;
  image_URL: string;
  image_alt: string;
  created_at: string | null;
  SEO_description: string;
  BlogCategories: { Categories: { name: string | null; slug: string | null } }[];
};

function safeSlug(value: string | null): value is string {
  return !!value && /^[\p{L}\p{N}]+(?:[\p{L}\p{N}_-]*[\p{L}\p{N}])?$/u.test(value);
}

function validDate(value: string | null): string | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value)) return null;
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  const normalized = new Date(timestamp).toISOString();
  return normalized.slice(0, 19) === value.slice(0, 19) ? normalized : null;
}

function blogTopic(text: string): HomepageBlogTopic {
  if (/x[\s-]?ray|hi[\s-]?scan|اسمیتس|ایکس[\s‌-]?ری|اشعه|بازرسی بار/i.test(text)) return "xray";
  if (/blackmagic|بلک[\s‌-]?مجیک|pyxis|پایکسیس/i.test(text)) return "blackmagic";
  if (/cctv|reolink|ریولینک|دوربین مداربسته|نظارت تصویری/i.test(text)) return "cctv";
  return "other";
}

const BLOG_REASONS: Record<HomepageBlogTopic, string> = {
  xray: "برای شناخت بهتر انتخاب تجهیزات بازرسی بخوانید.",
  blackmagic: "برای بررسی مسیر تولید تصویر بخوانید.",
  cctv: "برای تصمیم‌گیری درباره نظارت تصویری بخوانید.",
  other: "برای آشنایی بیشتر با این موضوع بخوانید.",
};

function selectHomepageBlogs(records: BlogCardRecord[]): HomepageBlogItem[] {
  const valid = records
    .flatMap((record) => {
      if (!safeSlug(record.slug)) return [];
      const categories = record.BlogCategories.map(({ Categories }) => Categories)
        .filter(({ slug }) => safeSlug(slug))
        .sort((a, b) => a.slug!.localeCompare(b.slug!));
      const titleTopic = blogTopic(record.title);
      const topic: HomepageBlogTopic =
        titleTopic !== "other"
          ? titleTopic
          : (categories
              .map((category) => blogTopic(`${category.name ?? ""} ${category.slug}`))
              .find((candidate) => candidate !== "other") ?? "other");
      const category =
        categories.find(
          (candidate) => blogTopic(`${candidate.name ?? ""} ${candidate.slug}`) === topic
        ) ?? categories[0];
      if (!category?.slug) return [];
      const image = resolveHomepageImage(record.image_URL, process.env.LIARA_BUCKET_URL);
      return [
        {
          id: record.id,
          title: record.title.trim(),
          href: `/support/blog/${encodeURIComponent(category.slug)}/${encodeURIComponent(record.slug)}`,
          category: category.name?.trim() || category.slug,
          topic,
          reasonToRead: BLOG_REASONS[topic],
          image,
          imageAlt: image ? record.image_alt.trim() || record.title.trim() : null,
          date: validDate(record.created_at),
          description: record.SEO_description.trim() || null,
        },
      ];
    })
    .filter((item) => item.title.length > 0);

  valid.sort((a, b) => (b.date ?? "").localeCompare(a.date ?? "") || b.id - a.id);
  const selected: HomepageBlogItem[] = [];
  for (const topic of ["xray", "blackmagic", "cctv"] as const) {
    const first = valid.find((item) => item.topic === topic);
    if (first) selected.push(first);
  }
  for (const item of valid) {
    if (selected.length === 3) break;
    if (!selected.some((selectedItem) => selectedItem.id === item.id)) selected.push(item);
  }
  return selected;
}

async function getHomepageBlogs(): Promise<HomepageBlogItem[]> {
  "use cache";
  cacheTag(TAGS.blogs);
  cacheLife("minutes");

  const baseWhere = { status: "Published", QrCode_key: null } as const;
  const orderBy = [{ created_at: "desc" as const }, { id: "desc" as const }];
  const recent = prisma.blogs.findMany({
    where: baseWhere,
    orderBy,
    take: BLOG_CANDIDATE_LIMIT,
    select: BLOG_SELECT,
  });
  const targeted = Object.values(BLOG_TOPIC_TERMS).map((terms) =>
    prisma.blogs.findMany({
      where: {
        ...baseWhere,
        OR: terms.flatMap((term) => [
          { title: { contains: term, mode: "insensitive" as const } },
          {
            BlogCategories: {
              some: {
                Categories: {
                  OR: [
                    { name: { contains: term, mode: "insensitive" as const } },
                    { slug: { contains: term, mode: "insensitive" as const } },
                  ],
                },
              },
            },
          },
        ]),
      },
      orderBy,
      take: BLOG_TOPIC_CANDIDATE_LIMIT,
      select: BLOG_SELECT,
    })
  );
  const batches = await Promise.all([recent, ...targeted]);
  return selectHomepageBlogs([
    ...new Map(batches.flat().map((record) => [record.id, record])).values(),
  ]);
}

async function getShowcaseProducts(): Promise<ShowcaseItem[]> {
  "use cache";
  cacheTag("showcase-products");
  cacheLife("hours");

  const records = await prisma.showcase_products.findMany({
    orderBy: { order: "asc" },
    take: 4,
    select: { id: true, title: true, description: true, image: true, link: true },
  });

  return records.flatMap((record) => {
    const image = resolveHomepageImage(record.image, process.env.LIARA_BUCKET_URL);
    return image
      ? [
          {
            id: record.id,
            title: record.title,
            desc: record.description,
            image,
            link: normalizeInternalLink(record.link),
          },
        ]
      : [];
  });
}

export async function getHomepageData(): Promise<HomepageData> {
  const [projectResult, productResult, blogResult] = await Promise.allSettled([
    getProjects(),
    getShowcaseProducts(),
    getHomepageBlogs(),
  ]);

  const published = projectResult.status === "fulfilled" ? projectResult.value : null;
  const projects = (published ?? [])
    .flatMap((project) => {
      const image = resolveHomepageImage(project.mainImg, process.env.LIARA_BUCKET_URL);
      return image ? [{ ...project, mainImg: image }] : [];
    })
    .slice(0, 3);

  return {
    projects,
    publishedProjectCount: published ? published.length : null,
    products: productResult.status === "fulfilled" ? productResult.value : [],
    blogs: blogResult.status === "fulfilled" ? blogResult.value : [],
    blogFeedStatus: blogResult.status === "fulfilled" ? "ready" : "unavailable",
  };
}
