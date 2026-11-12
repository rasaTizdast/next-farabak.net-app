import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getBlogBySlugMock, ioMock } = vi.hoisted(() => ({
  getBlogBySlugMock: vi.fn(),
  ioMock: vi.fn(async () => undefined),
}));

vi.mock("next/cache", () => ({ io: ioMock }));
vi.mock("@/lib/data/blogs", () => ({ getBlogBySlug: getBlogBySlugMock }));

import { generateMetadata } from "./page";

describe("blog article metadata", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://farabak.net");
    getBlogBySlugMock.mockResolvedValue({
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
    });
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
});
