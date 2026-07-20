import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    projects: {
      findFirst: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/projects/getProjectData/[slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return transformed project data", async () => {
    const mockProject = {
      ProjectID: 1,
      Title: "Project Alpha",
      Description: "A great project",
      date: "2024-01-01",
      city: "Tehran",
      Slug: "project-alpha",
      ProjectMedia: [
        { MediaID: 1, MediaType: "image", MediaURL: "img1.jpg" },
        { MediaID: 2, MediaType: "image", MediaURL: "img2.jpg" },
        { MediaID: 3, MediaType: "video", MediaURL: "vid1.mp4" },
      ],
    };
    mockPrisma.projects.findFirst.mockResolvedValue(mockProject);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "project-alpha" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.id).toBe(1);
    expect(body.title).toBe("Project Alpha");
    expect(body.images).toHaveLength(2);
    expect(body.video).toBe("vid1.mp4");
    expect(mockPrisma.projects.findFirst).toHaveBeenCalledWith({
      where: { Slug: "project-alpha" },
      include: { ProjectMedia: true },
    });
  });

  it("should return 404 when project not found", async () => {
    mockPrisma.projects.findFirst.mockResolvedValue(null);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "not-found" }),
    });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.message).toBe("Project not found");
  });

  it("should handle project with no media", async () => {
    const mockProject = {
      ProjectID: 2,
      Title: "Empty Project",
      Description: "No media",
      date: "2024-02",
      city: "Isfahan",
      Slug: "empty",
      ProjectMedia: [],
    };
    mockPrisma.projects.findFirst.mockResolvedValue(mockProject);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "empty" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.images).toEqual([]);
    expect(body.video).toBeUndefined();
  });

  it("should return 500 on error", async () => {
    mockPrisma.projects.findFirst.mockRejectedValue(new Error("DB error"));

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "project-alpha" }),
    });
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.message).toBe("Internal server error");
  });
});
