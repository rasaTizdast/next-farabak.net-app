import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockS3 } = vi.hoisted(() => ({
  mockPrisma: {
    projects: {
      findMany: vi.fn(),
      create: vi.fn(),
      findFirst: vi.fn(),
    },
    projectMedia: {
      create: vi.fn(),
    },
  },
  mockS3: {
    putObject: vi.fn().mockReturnValue({ promise: vi.fn().mockResolvedValue({}) }),
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("aws-sdk", () => ({
  S3: vi.fn().mockImplementation(function () { return mockS3; }),
}));

import { GET, POST } from "../route";

describe("GET /api/projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return transformed projects", async () => {
    const mockProjects = [
      {
        ProjectID: 1,
        Title: "Project A",
        Description: "Desc",
        Main_img_URL: "main.jpg",
        date: "2024-01",
        city: "Tehran",
        Slug: "project-a",
        ProjectMedia: [
          { MediaType: "image", MediaURL: "img1.jpg" },
          { MediaType: "video", MediaURL: "vid1.mp4" },
        ],
      },
    ];
    mockPrisma.projects.findMany.mockResolvedValue(mockProjects);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe(1);
    expect(body[0].title).toBe("Project A");
    expect(body[0].media).toHaveLength(2);
  });

  it("should return 404 when no projects found", async () => {
    mockPrisma.projects.findMany.mockResolvedValue([]);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toBe("No projects found");
  });

  it("should return 500 on error", async () => {
    mockPrisma.projects.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Internal server error");
  });
});

describe("POST /api/projects", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function createFormData(fields: Record<string, string | File | null>): Request {
    const fd = new FormData();
    for (const [key, value] of Object.entries(fields)) {
      if (value instanceof File) {
        fd.append(key, value);
      } else if (value !== null) {
        fd.append(key, value);
      }
    }
    return new Request("http://localhost/api/projects", {
      method: "POST",
      body: fd,
    });
  }

  it("should create project with media", async () => {
    mockPrisma.projects.findFirst.mockResolvedValue(null);
    const mockProject = { ProjectID: 1, Title: "P1", Slug: "p1" };
    mockPrisma.projects.create.mockResolvedValue(mockProject);
    mockPrisma.projectMedia.create.mockResolvedValue({});

    const file = new File(["img"], "main.jpg", { type: "image/jpeg" });
    const req = createFormData({
      title: "P1",
      description: "Desc",
      slug: "p1",
      date: "2024-01",
      city: "Tehran",
      mainImage: file,
      isActive: "true",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body).toEqual(mockProject);
  });

  it("should return 400 for missing required fields", async () => {
    const req = createFormData({
      title: "P1",
      description: "Desc",
      slug: "p1",
      date: "2024-01",
      city: "Tehran",
      mainImage: null,
      isActive: "true",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("الزامی");
  });

  it("should return 400 for duplicate slug", async () => {
    mockPrisma.projects.findFirst.mockResolvedValue({ Slug: "p1" });

    const file = new File(["img"], "main.jpg", { type: "image/jpeg" });
    const req = createFormData({
      title: "P1",
      description: "Desc",
      slug: "p1",
      date: "2024-01",
      city: "Tehran",
      mainImage: file,
      isActive: "true",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("پروژه با این اسلاگ وجود دارد");
  });

  it("should return 500 on error", async () => {
    mockPrisma.projects.findFirst.mockRejectedValue(new Error("DB error"));

    const req = createFormData({
      title: "P1",
      description: "Desc",
      slug: "p1",
      date: "2024-01",
      city: "Tehran",
      mainImage: new File(["img"], "img.jpg", { type: "image/jpeg" }),
      isActive: "true",
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
  });
});
