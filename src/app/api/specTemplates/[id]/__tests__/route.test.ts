import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    $queryRaw: vi.fn(),
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET, PUT, DELETE } from "../route";

describe("GET /api/specTemplates/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return a template with items", async () => {
    const template = [{ SpecTemplateId: 1, Name: "Template A" }];
    const items = [{ SpecTemplateItemId: 1, SpecTemplateId: 1, Title: "Item 1" }];

    mockPrisma.$queryRaw
      .mockResolvedValueOnce(template)
      .mockResolvedValueOnce(items);

    const req = new Request("http://localhost/api/specTemplates/1");
    const res = await GET(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.Name).toBe("Template A");
    expect(body.Items).toEqual(items);
  });

  it("should return 400 for invalid ID", async () => {
    const req = new Request("http://localhost/api/specTemplates/abc");
    const res = await GET(req as any, { params: Promise.resolve({ id: "abc" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Invalid template ID");
  });

  it("should return 404 when template not found", async () => {
    mockPrisma.$queryRaw.mockResolvedValue([]);

    const req = new Request("http://localhost/api/specTemplates/999");
    const res = await GET(req as any, { params: Promise.resolve({ id: "999" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toBe("Template not found");
  });

  it("should return 500 on error", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/specTemplates/1");
    const res = await GET(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Error fetching spec template");
  });
});

describe("PUT /api/specTemplates/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should update a template with items", async () => {
    const updatedTemplate = [{ SpecTemplateId: 1, Name: "Updated Template" }];
    const items = [{ SpecTemplateItemId: 2, SpecTemplateId: 1, Title: "Updated Item" }];

    mockPrisma.$queryRaw
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(updatedTemplate)
      .mockResolvedValueOnce(items);

    const req = new Request("http://localhost/api/specTemplates/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Name: "Updated Template", Items: [{ Title: "Updated Item" }] }),
    });

    const res = await PUT(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.Name).toBe("Updated Template");
    expect(body.Items).toEqual(items);
  });

  it("should return 400 for invalid ID", async () => {
    const req = new Request("http://localhost/api/specTemplates/abc", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Name: "Test" }),
    });
    const res = await PUT(req as any, { params: Promise.resolve({ id: "abc" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Invalid template ID");
  });

  it("should return 400 when name is missing", async () => {
    const req = new Request("http://localhost/api/specTemplates/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Items: [] }),
    });
    const res = await PUT(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Template name is required");
  });

  it("should return 500 on error", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/specTemplates/1", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Name: "Test" }),
    });
    const res = await PUT(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Error updating spec template");
  });
});

describe("DELETE /api/specTemplates/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete a template successfully", async () => {
    mockPrisma.$queryRaw.mockResolvedValue(undefined);

    const req = new Request("http://localhost/api/specTemplates/1", { method: "DELETE" });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toBe("Template deleted successfully");
  });

  it("should return 400 for invalid ID", async () => {
    const req = new Request("http://localhost/api/specTemplates/abc", { method: "DELETE" });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "abc" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.message).toBe("Invalid template ID");
  });

  it("should return 500 on error", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/specTemplates/1", { method: "DELETE" });
    const res = await DELETE(req as any, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Error deleting spec template");
  });
});
