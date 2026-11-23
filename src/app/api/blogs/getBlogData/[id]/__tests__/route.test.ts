import { beforeEach, describe, expect, it, vi } from "vitest";

const ctx = await vi.hoisted(async () => {
  const { createApiTestContext } = await import("@/test/api-test-utils");
  process.env.JWT_SECRET = "test-secret";
  return createApiTestContext({
    client: { findUnique: vi.fn() },
    blogs: { findUnique: vi.fn() },
    media: { findMany: vi.fn() },
  });
});

vi.mock("next/headers", () => ctx.mockNextHeaders());
vi.mock("jose", () => ctx.mockJose());
vi.mock("@/lib/prisma", () => ctx.mockPrismaModule());

import { GET } from "../route";

const findActor = (ctx.mockPrisma.client as { findUnique: ReturnType<typeof vi.fn> }).findUnique;
const findBlog = (ctx.mockPrisma.blogs as { findUnique: ReturnType<typeof vi.fn> }).findUnique;
const findMedia = (ctx.mockPrisma.media as { findMany: ReturnType<typeof vi.fn> }).findMany;
const params = (id: string) => ({ params: Promise.resolve({ id }) });
const request = () => new Request("http://localhost/api/blogs/getBlogData/1");

const mockBlogData = {
  id: 1,
  title: "Test Blog",
  SEO_Title: "SEO",
  slug: "test-blog",
  created_at: "2025-01-01",
  status: "Draft",
  views_count: 100,
  content: "content",
  author: "Author",
  SEO_description: "desc",
  image_URL: "img.jpg",
  image_alt: "alt",
  BlogCategories: [{ Categories: { id: 1, name: "Tech", slug: "tech" } }],
  Comments: [{ id: 1, content: "Legacy editor data", created_at: "2025-01-02" }],
  Likes: [{ id: 1 }],
};

describe("GET /api/blogs/getBlogData/[id]", () => {
  beforeEach(() => {
    ctx.resetAll();
    findActor.mockReset();
    findBlog.mockReset();
    findMedia.mockReset();
  });

  it("rejects anonymous requests before loading editing data", async () => {
    const response = await GET(request(), params("1"));

    expect(response.status).toBe(401);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(findActor).not.toHaveBeenCalled();
    expect(findBlog).not.toHaveBeenCalled();
  });

  it("rechecks the database role and denies a demoted Admin JWT before loading data", async () => {
    ctx.setupAuth("Admin", { userId: 18 });
    findActor.mockResolvedValue({ Role: "Public" });

    const response = await GET(request(), params("1"));

    expect(response.status).toBe(403);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(findActor).toHaveBeenCalledWith({
      where: { UserID: 18 },
      select: { Role: true },
    });
    expect(findBlog).not.toHaveBeenCalled();
  });

  it("returns legacy edit data only after the current database role is Admin", async () => {
    ctx.setupAuth("Admin", { userId: 18 });
    findActor.mockResolvedValue({ Role: "Admin" });
    findBlog.mockResolvedValue(mockBlogData);
    findMedia.mockResolvedValue([
      { id: 1, media_type: "image", media_URL: "http://media/1.jpg", media_alt: "pic" },
    ]);

    const response = await GET(request(), params("1"));

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    const json = await response.json();
    expect(json.blog.title).toBe("Test Blog");
    expect(json.comments[0].content).toBe("Legacy editor data");
    expect(findActor.mock.invocationCallOrder[0]).toBeLessThan(
      findBlog.mock.invocationCallOrder[0]
    );
  });

  it("returns 404 for an unknown blog after authorization", async () => {
    ctx.setupAuth("Admin", { userId: 18 });
    findActor.mockResolvedValue({ Role: "Admin" });
    findBlog.mockResolvedValue(null);

    const response = await GET(request(), params("999"));

    expect(response.status).toBe(404);
    expect(findBlog).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 999 } }));
  });

  it("returns 500 on a database error after authorization", async () => {
    ctx.setupAuth("Admin", { userId: 18 });
    findActor.mockResolvedValue({ Role: "Admin" });
    findBlog.mockRejectedValue(new Error("DB error"));

    const response = await GET(request(), params("1"));

    expect(response.status).toBe(500);
  });
});
