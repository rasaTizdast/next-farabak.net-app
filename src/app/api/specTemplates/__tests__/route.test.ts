import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    $queryRaw: vi.fn(),
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET, POST } from "../route";

describe("GET /api/specTemplates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return templates with items", async () => {
    const templates = [
      { SpecTemplateId: 1, Name: "Template A" },
      { SpecTemplateId: 2, Name: "Template B" },
    ];
    const items1 = [{ SpecTemplateItemId: 1, SpecTemplateId: 1, Title: "Item 1" }];
    const items2 = [{ SpecTemplateItemId: 2, SpecTemplateId: 2, Title: "Item 2" }];

    mockPrisma.$queryRaw
      .mockResolvedValueOnce(templates)
      .mockResolvedValueOnce(items1)
      .mockResolvedValueOnce(items2);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].Items).toEqual(items1);
    expect(body[1].Items).toEqual(items2);
  });

  it("should return 500 on error", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Error fetching spec templates");
  });
});

describe("POST /api/specTemplates", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a template with items", async () => {
    const templateResult = [{ SpecTemplateId: 1 }];
    const createdTemplate = [{ SpecTemplateId: 1, Name: "New Template" }];
    const items = [{ SpecTemplateItemId: 1, SpecTemplateId: 1, Title: "Item 1" }];

    mockPrisma.$queryRaw
      .mockResolvedValueOnce(templateResult)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(createdTemplate)
      .mockResolvedValueOnce(items);

    const req = new Request("http://localhost/api/specTemplates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Name: "New Template", Items: [{ Title: "Item 1" }] }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.Name).toBe("New Template");
    expect(body.Items).toEqual(items);
  });

  it("should create a template without items", async () => {
    const templateResult = [{ SpecTemplateId: 2 }];
    const createdTemplate = [{ SpecTemplateId: 2, Name: "Empty Template" }];
    const items: never[] = [];

    mockPrisma.$queryRaw
      .mockResolvedValueOnce(templateResult)
      .mockResolvedValueOnce(createdTemplate)
      .mockResolvedValueOnce(items);

    const req = new Request("http://localhost/api/specTemplates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Name: "Empty Template" }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.Name).toBe("Empty Template");
  });

  it("should return 400 when name is missing", async () => {
    const req = new Request("http://localhost/api/specTemplates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Items: [] }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Template name is required");
  });

  it("should return 500 on error", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/specTemplates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Name: "Test" }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Error creating spec template");
  });
});
