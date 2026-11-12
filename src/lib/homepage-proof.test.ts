import { beforeEach, describe, expect, it, vi } from "vitest";

import type { HomepageTestimonial } from "@/content/homepage-proof";
import { getHomepageData } from "@/lib/data/homepage";
import { getProjects } from "@/lib/data/projects";
import {
  normalizeInternalLink,
  publishedTestimonials,
  resolveHomepageImage,
} from "@/lib/homepage-proof";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: { blogs: { findMany: vi.fn() } },
}));
vi.mock("@/lib/data/projects", () => ({ getProjects: vi.fn() }));

const approvedQuote: HomepageTestimonial = {
  quote: "مشاوره و پشتیبانی دقیق بود.",
  name: "مشتری دارای تأیید انتشار",
  role: "مدیر پروژه",
  source: "نامه تأیید مشتری",
  approvedForPublication: true,
};

const bucket = "https://s3.farabak.net/media";

describe("publishedTestimonials", () => {
  it("publishes only approved quotes with complete attribution and a source", () => {
    expect(
      publishedTestimonials([
        approvedQuote,
        { ...approvedQuote, approvedForPublication: false },
        { ...approvedQuote, name: " " },
        { ...approvedQuote, role: "" },
        { ...approvedQuote, quote: " " },
        { ...approvedQuote, source: " " },
      ])
    ).toEqual([approvedQuote]);
  });

  it("trims approved content without changing the source record", () => {
    const input = { ...approvedQuote, name: "  مشتری دارای تأیید انتشار  " };
    expect(publishedTestimonials([input])[0]?.name).toBe("مشتری دارای تأیید انتشار");
    expect(input.name).toBe("  مشتری دارای تأیید انتشار  ");
  });
});

describe("normalizeInternalLink", () => {
  it.each([
    ["/products//reolink///camera", "/products/reolink/camera"],
    ["products/reolink", "/products/reolink"],
    [" https://farabak.net/products//reolink?q=4k#details ", "/products/reolink?q=4k#details"],
    ["https://www.farabak.net/about-us/projects", "/about-us/projects"],
    ["/products/دوربین", "/products/دوربین"],
  ])("normalizes the internal destination %s", (input, expected) => {
    expect(normalizeInternalLink(input)).toBe(expected);
  });

  it.each([
    "javascript:alert(1)",
    "data:text/html,hello",
    "https://example.com/products",
    "https://farabak.net.evil.example/products",
    "https://farabak.net@evil.example/products",
    "//example.com/products",
    "/\\example.com/products",
    "/products/../admin",
    "/products/%2e%2e/admin",
    "/products/%252e%252e/admin",
    "/products/\u0000camera",
    "",
  ])("uses the safe fallback for %s", (input) => {
    expect(normalizeInternalLink(input)).toBe("/products");
  });

  it("honors a safe internal fallback", () => {
    expect(normalizeInternalLink("javascript:alert(1)", "/contact-us")).toBe("/contact-us");
  });

  it("does not accept an unsafe fallback", () => {
    expect(normalizeInternalLink("", "https://evil.example")).toBe("/products");
  });
});

describe("resolveHomepageImage", () => {
  it.each([
    [
      "project-images//camera.webp",
      bucket,
      "https://s3.farabak.net/media/project-images/camera.webp",
    ],
    ["/images//camera.webp", undefined, "/images/camera.webp"],
    [
      "https://s3.farabak.net/media/project-images/camera.webp",
      bucket,
      "https://s3.farabak.net/media/project-images/camera.webp",
    ],
  ])("resolves the valid media source %s", (key, base, expected) => {
    expect(resolveHomepageImage(key, base)).toBe(expected);
  });

  it.each([
    ["project-images/camera.webp", undefined],
    ["../private/camera.webp", bucket],
    ["project-images/%2e%2e/camera.webp", bucket],
    ["/images/%252e%252e/private.webp", bucket],
    ["//evil.example/camera.webp", bucket],
    ["https://evil.example/camera.webp", bucket],
    ["http://s3.farabak.net/media/camera.webp", bucket],
    ["https://s3.farabak.net/other/camera.webp", bucket],
    ["javascript:alert(1)", bucket],
    ["project-images/camera.webp", "http://s3.farabak.net/media"],
    ["project-images/\\camera.webp", bucket],
    ["", bucket],
  ])("rejects the unsafe or unresolvable media source %s", (key, base) => {
    expect(resolveHomepageImage(key, base)).toBeNull();
  });
});

describe("getHomepageData", () => {
  beforeEach(() => {
    vi.mocked(prisma.blogs.findMany).mockResolvedValue([]);
  });
  it("keeps the blog feed available when project records fail", async () => {
    vi.mocked(getProjects).mockRejectedValueOnce(new Error("unavailable"));
    vi.mocked(prisma.blogs.findMany).mockResolvedValueOnce([
      {
        id: 7,
        title: "Reolink",
        slug: "camera-guide",
        image_URL: "/images/camera.webp",
        image_alt: "راهنمای دوربین",
        created_at: "2026-10-20T10:00:00.000Z",
        SEO_description: "راهنمای انتخاب دوربین",
        BlogCategories: [{ Categories: { name: "راهنما", slug: "camera" } }],
      },
    ] as never);
    expect(await getHomepageData()).toEqual({
      projects: [],
      publishedProjectCount: null,
      blogs: [
        {
          id: 7,
          title: "Reolink",
          href: "/support/blog/camera/camera-guide",
          category: "راهنما",
          topic: "cctv",
          reasonToRead: "برای تصمیم‌گیری درباره نظارت تصویری بخوانید.",
          image: "/images/camera.webp",
          imageAlt: "راهنمای دوربین",
          date: "2026-10-20T10:00:00.000Z",
          description: "راهنمای انتخاب دوربین",
        },
      ],
      blogFeedStatus: "ready",
    });
  });

  it("distinguishes a successful empty project feed from a failed feed", async () => {
    vi.mocked(getProjects).mockResolvedValueOnce([]);
    expect(await getHomepageData()).toEqual({
      projects: [],
      publishedProjectCount: 0,
      blogs: [],
      blogFeedStatus: "ready",
    });
  });

  it("counts published records while limiting visible projects and dropping unsafe media", async () => {
    vi.mocked(getProjects).mockResolvedValueOnce(
      Array.from({ length: 5 }, (_, index) => ({
        id: index + 1,
        title: "پروژه",
        smallDesc: "توضیح",
        mainImg: "/images/project.webp",
        date: "2026-01-01",
        location: "تهران",
        slug: "project-" + index,
        media: [],
      }))
    );
    const result = await getHomepageData();
    expect(result.publishedProjectCount).toBe(5);
    expect(result.projects).toHaveLength(3);
  });
});
