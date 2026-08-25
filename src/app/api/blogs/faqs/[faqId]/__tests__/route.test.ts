import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    blogFAQs: { update: vi.fn(), delete: vi.fn() },
  },
}));
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(function () {
    return mockPrisma;
  }),
}));
vi.mock("@/utils/jalaliDate", () => ({
  getCurrentJalaliDate: vi.fn().mockReturnValue("1404-06-23"),
}));

import { PUT, DELETE } from "../route";

describe("PUT /api/blogs/faqs/[faqId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates a FAQ successfully", async () => {
    const updatedFaq = { id: 1, question: "Updated Q?", answer: "Updated A", order: 2 };
    mockPrisma.blogFAQs.update.mockResolvedValue(updatedFaq);

    const req = new Request("http://localhost/api/blogs/faqs/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Updated Q?", answer: "Updated A", order: 2 }),
    });

    const res = await PUT(req as any, { params: Promise.resolve({ faqId: "1" }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.faq.question).toBe("Updated Q?");
    expect(json.faq.answer).toBe("Updated A");
  });

  it("returns 400 for invalid faqId", async () => {
    const req = new Request("http://localhost/api/blogs/faqs/abc", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Q" }),
    });

    const res = await PUT(req as any, { params: Promise.resolve({ faqId: "abc" }) });
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.message).toContain("Invalid");
  });

  it("returns 400 when question is empty string", async () => {
    const req = new Request("http://localhost/api/blogs/faqs/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "   ", answer: "Answer" }),
    });

    const res = await PUT(req as any, { params: Promise.resolve({ faqId: "1" }) });
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.message).toContain("سوال");
  });

  it("returns 400 when answer is empty string", async () => {
    const req = new Request("http://localhost/api/blogs/faqs/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Question", answer: "   " }),
    });

    const res = await PUT(req as any, { params: Promise.resolve({ faqId: "1" }) });
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.message).toContain("پاسخ");
  });

  it("returns 404 on P2025 (FAQ not found)", async () => {
    const error = new Error("Record not found") as any;
    error.code = "P2025";
    mockPrisma.blogFAQs.update.mockRejectedValue(error);

    const req = new Request("http://localhost/api/blogs/faqs/999", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Q", answer: "A" }),
    });

    const res = await PUT(req as any, { params: Promise.resolve({ faqId: "999" }) });
    expect(res.status).toBe(404);
  });

  it("returns 500 on generic error", async () => {
    mockPrisma.blogFAQs.update.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/blogs/faqs/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "Q", answer: "A" }),
    });

    const res = await PUT(req as any, { params: Promise.resolve({ faqId: "1" }) });
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/blogs/faqs/[faqId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a FAQ successfully", async () => {
    mockPrisma.blogFAQs.delete.mockResolvedValue({ id: 1 });

    const res = await DELETE(undefined as any, { params: Promise.resolve({ faqId: "1" }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.message).toContain("موفقیت");
  });

  it("returns 400 for invalid faqId", async () => {
    const res = await DELETE(undefined as any, { params: Promise.resolve({ faqId: "abc" }) });
    expect(res.status).toBe(400);
  });

  it("returns 404 on P2025 (FAQ not found)", async () => {
    const error = new Error("Record not found") as any;
    error.code = "P2025";
    mockPrisma.blogFAQs.delete.mockRejectedValue(error);

    const res = await DELETE(undefined as any, { params: Promise.resolve({ faqId: "999" }) });
    expect(res.status).toBe(404);
  });

  it("returns 500 on generic error", async () => {
    mockPrisma.blogFAQs.delete.mockRejectedValue(new Error("DB error"));

    const res = await DELETE(undefined as any, { params: Promise.resolve({ faqId: "1" }) });
    expect(res.status).toBe(500);
  });
});
