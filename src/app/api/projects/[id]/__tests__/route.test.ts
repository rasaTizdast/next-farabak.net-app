import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockS3Instance } = vi.hoisted(() => ({
  mockPrisma: {
    projects: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findFirst: vi.fn(),
    },
    projectMedia: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
  mockS3Instance: {
    deleteObject: vi.fn(),
    listObjectsV2: vi.fn(),
    deleteObjects: vi.fn(),
    putObject: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("aws-sdk", () => ({
  S3: vi.fn().mockImplementation(function () {
    return mockS3Instance;
  }),
}));

import { GET, PUT, DELETE } from "../route";

describe("GET /api/projects/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return project by id", async () => {
    const mockProject = {
      ProjectID: 1,
      Title: "P1",
      ProjectMedia: [{ MediaID: 1, MediaType: "image", MediaURL: "img.jpg" }],
    };
    mockPrisma.projects.findUnique.mockResolvedValue(mockProject);

    const res = await GET(new NextRequest("http://localhost"), {
      params: Promise.resolve({ id: "1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.project).toEqual(mockProject);
    expect(body.media).toEqual(mockProject.ProjectMedia);
  });

  it("should return 404 when project not found", async () => {
    mockPrisma.projects.findUnique.mockResolvedValue(null);

    const res = await GET(new NextRequest("http://localhost"), {
      params: Promise.resolve({ id: "999" }),
    });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("پروژه پیدا نشد");
  });

  it("should return 500 on error", async () => {
    mockPrisma.projects.findUnique.mockRejectedValue(new Error("DB error"));

    const res = await GET(new NextRequest("http://localhost"), {
      params: Promise.resolve({ id: "1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("خطا در دریافت اطلاعات پروژه");
  });
});

describe("PUT /api/projects/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 404 when project not found", async () => {
    mockPrisma.projects.findUnique.mockResolvedValue(null);

    const fd = new FormData();
    fd.append("title", "P1");
    fd.append("slug", "p1");
    const req = new NextRequest("http://localhost", { method: "PUT", body: fd });

    const res = await PUT(req, { params: Promise.resolve({ id: "999" }) });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("پروژه پیدا نشد");
  });

  it("should return 400 for duplicate slug", async () => {
    const existing = { ProjectID: 1, Slug: "old-slug", ProjectMedia: [] };
    mockPrisma.projects.findUnique.mockResolvedValue(existing);
    mockPrisma.projects.findFirst.mockResolvedValue({ Slug: "new-slug" });

    const fd = new FormData();
    fd.append("title", "P1");
    fd.append("slug", "new-slug");
    const req = new NextRequest("http://localhost", { method: "PUT", body: fd });

    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("اسلاگ تکراری است");
  });

  it("should return 500 on error", async () => {
    mockPrisma.projects.findUnique.mockRejectedValue(new Error("DB error"));

    const fd = new FormData();
    fd.append("title", "P1");
    fd.append("slug", "p1");
    const req = new NextRequest("http://localhost", { method: "PUT", body: fd });

    const res = await PUT(req, { params: Promise.resolve({ id: "1" }) });
    await res.json();

    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/projects/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete project and media", async () => {
    const mockProject = {
      ProjectID: 1,
      Slug: "p1",
      ProjectMedia: [{ MediaType: "image", MediaURL: "img.jpg" }],
    };
    mockPrisma.projects.findUnique.mockResolvedValue(mockProject);

    const mockListResult = {
      Contents: [],
      NextContinuationToken: undefined,
    };
    mockS3Instance.listObjectsV2.mockResolvedValue(mockListResult);

    const res = await DELETE(new NextRequest("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ id: "1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.message).toContain("موفقیت");
    expect(mockPrisma.projectMedia.deleteMany).toHaveBeenCalled();
    expect(mockPrisma.projects.delete).toHaveBeenCalled();
  });

  it("should return 404 when project not found", async () => {
    mockPrisma.projects.findUnique.mockResolvedValue(null);

    const res = await DELETE(new NextRequest("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ id: "999" }),
    });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toBe("پروژه پیدا نشد");
  });

  it("should return 500 on error", async () => {
    mockPrisma.projects.findUnique.mockRejectedValue(new Error("DB error"));

    const res = await DELETE(new NextRequest("http://localhost", { method: "DELETE" }), {
      params: Promise.resolve({ id: "1" }),
    });
    await res.json();

    expect(res.status).toBe(500);
  });
});
