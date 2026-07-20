import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    blogs: { findUnique: vi.fn() },
    blogFAQs: { findMany: vi.fn(), create: vi.fn() },
  },
}));
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(function () { return mockPrisma; }),
}));
vi.mock("@/utils/jalaliDate", () => ({
  getCurrentJalaliDate: vi.fn().mockReturnValue("1404-06-23"),
}));

import { GET, POST } from "../route";

describe("GET /api/blogs/manage/[blogId]/faqs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns FAQs for a blog", async () => {
    mockPrisma.blogFAQs.findMany.mockResolvedValue([
      { id: 1, blog_id: 1, question: "Q1?", answer: "A1", order: 1 },
      { id: 2, blog_id: 1, question: "Q2?", answer: "A2", order: 2 },
    ]);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ blogId: "1" }),
    });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.faqs).toHaveLength(2);
  });

  it("returns 400 for invalid blogId", async () => {
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ blogId: "abc" }),
    });
    expect(res.status).toBe(400);
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.blogFAQs.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ blogId: "1" }),
    });
    expect(res.status).toBe(500);
  });
});

describe("POST /api/blogs/manage/[blogId]/faqs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a new FAQ for a blog", async () => {
    mockPrisma.blogs.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.blogFAQs.create.mockResolvedValue({
      id: 1,
      blog_id: 1,
      question: "New Q?",
      answer: "New A",
      order: 1,
      available: true,
    });

    const req = new Request("http://localhost/api/blogs/manage/1/faqs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "New Q?", answer: "New A", order: 1, available: true }),
    });

    const res = await POST(req as any, { params: Promise.resolve({ blogId: "1" }) });
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.faq.question).toBe("New Q?");
    expect(json.faq.blog_id).toBe(1);
  });

  it("returns 400 for invalid blogId", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Q", answer: "A" }),
    });

    const res = await POST(req as any, { params: Promise.resolve({ blogId: "abc" }) });
    expect(res.status).toBe(400);
  });

  it("returns 400 when question or answer is missing", async () => {
    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Q" }),
    });

    const res = await POST(req as any, { params: Promise.resolve({ blogId: "1" }) });
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.message).toContain("الزامی");
  });

  it("returns 404 when blog not found", async () => {
    mockPrisma.blogs.findUnique.mockResolvedValue(null);

    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Q?", answer: "A" }),
    });

    const res = await POST(req as any, { params: Promise.resolve({ blogId: "999" }) });
    expect(res.status).toBe(404);
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.blogs.findUnique.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Q?", answer: "A" }),
    });

    const res = await POST(req as any, { params: Promise.resolve({ blogId: "1" }) });
    expect(res.status).toBe(500);
  });
});
