import type { Metadata } from "next";
import { isValidElement, type ElementType, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getBlogBySlugMock, ioMock } = vi.hoisted(() => ({
  getBlogBySlugMock: vi.fn(),
  ioMock: vi.fn(async () => undefined),
}));

vi.mock("next/cache", () => ({ io: ioMock }));
vi.mock("@/lib/data/blogs", () => ({ getBlogBySlug: getBlogBySlugMock }));

import CommentSection from "@/components/comments/CommentSection";

import BlogPage, { generateMetadata } from "./page";

const articleData = {
  blog: {
    id: 1,
    title: "راهنمای انتخاب دستگاه ایکس ری",
    SEO_Title: "راهنمای انتخاب دستگاه ایکس ری",
    slug: "x-ray-luggage-scanner-selection-guide",
    created_at: "2026-11-01T08:00:00.000Z",
    status: "Published",
    views_count: 0,
    content: "متن مقاله",
    author: "فرابک",
    SEO_description: "راهنمای خرید دستگاه ایکس ری چمدانی",
    image_URL: "blog/x-ray-guide.webp",
    image_alt: "دستگاه ایکس ری چمدانی",
    QrCode_key: null,
    QrCode_expiryDays: null,
  },
  categories: [{ id: 1, name: "ایکس ری", slug: "x-ray" }],
  comments: [],
  likes: 0,
  media: [],
  faqs: [],
};

function containsElement(node: ReactNode, type: ElementType): boolean {
  if (Array.isArray(node)) return node.some((child) => containsElement(child, type));
  if (!isValidElement<{ children?: ReactNode }>(node)) return false;
  return node.type === type || containsElement(node.props.children, type);
}

describe("blog article metadata", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://farabak.net");
    getBlogBySlugMock.mockResolvedValue(articleData);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("starts request-time rendering before reading article dates", async () => {
    await generateMetadata({
      params: Promise.resolve({
        blogCategory: "x-ray",
        blog: "x-ray-luggage-scanner-selection-guide",
      }),
      searchParams: Promise.resolve({}),
    });

    expect(ioMock).toHaveBeenCalledTimes(1);
    expect(ioMock.mock.invocationCallOrder[0]).toBeLessThan(
      getBlogBySlugMock.mock.invocationCallOrder[0]
    );
  });

  it("rejects a category slug that does not belong to the article", async () => {
    await expect(
      generateMetadata({
        params: Promise.resolve({
          blogCategory: "wrong-category",
          blog: "x-ray-luggage-scanner-selection-guide",
        }),
        searchParams: Promise.resolve({}),
      })
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");
  });

  it("shows comments on a published article whose QR key is empty", async () => {
    getBlogBySlugMock.mockResolvedValue({
      ...articleData,
      blog: { ...articleData.blog, QrCode_key: "" },
    });

    const page = await BlogPage({
      params: Promise.resolve({
        blogCategory: "x-ray",
        blog: "x-ray-luggage-scanner-selection-guide",
      }),
      searchParams: Promise.resolve({}),
    });

    expect(containsElement(page, CommentSection)).toBe(true);
  });

  it("uses route-specific Open Graph and Twitter metadata", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({
        blogCategory: "x-ray",
        blog: "x-ray-luggage-scanner-selection-guide",
      }),
      searchParams: Promise.resolve({}),
    });

    expect((metadata as Metadata).openGraph).toMatchObject({
      title: "راهنمای انتخاب دستگاه ایکس ری",
      url: "https://farabak.net/support/blog/x-ray/x-ray-luggage-scanner-selection-guide",
    });
    expect((metadata as Metadata).twitter).toMatchObject({
      title: "راهنمای انتخاب دستگاه ایکس ری",
    });
  });
});
