import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    faqDetails: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/faqs/general", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns available FAQs", async () => {
    mockPrisma.faqDetails.findMany.mockResolvedValue([
      { FaqDetailsid: 1, Q: "What is this?", A: "It is a test." },
      { FaqDetailsid: 2, Q: "How does it work?", A: "Like this." },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.faqs).toHaveLength(2);
  });

  it("returns empty array when no FAQs", async () => {
    mockPrisma.faqDetails.findMany.mockResolvedValue([]);

    const res = await GET();
    const json = await res.json();
    expect(json.faqs).toEqual([]);
  });

  it("returns 500 on error", async () => {
    mockPrisma.faqDetails.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});
