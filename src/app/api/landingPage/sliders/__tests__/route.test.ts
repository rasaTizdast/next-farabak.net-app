import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockS3Instance, mockUuid } = vi.hoisted(() => {
  const s3Inst = {
    putObject: vi.fn().mockReturnValue({ promise: vi.fn().mockResolvedValue({}) }),
  };
  return {
    mockPrisma: {
      sliders: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
    },
    mockS3Instance: s3Inst,
    mockUuid: vi.fn(() => "test-uuid-123"),
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("aws-sdk", () => ({
  S3: class {
    constructor() {}
    putObject(...args: unknown[]) {
      return mockS3Instance.putObject(...args);
    }
  },
}));
vi.mock("uuid", () => ({ v4: mockUuid }));

import { GET, POST } from "../route";

describe("GET /api/landingPage/sliders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return sliders", async () => {
    const sliders = [
      { id: 1, image_URL: "img1.jpg", link: "/page1" },
      { id: 2, image_URL: "img2.jpg", link: "/page2" },
    ];
    mockPrisma.sliders.findMany.mockResolvedValue(sliders);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(sliders);
  });

  it("should return 500 on error", async () => {
    mockPrisma.sliders.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to fetch sliders");
  });
});

describe("POST /api/landingPage/sliders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a slider with file upload", async () => {
    const newSlider = {
      id: 1,
      image_URL: "slider-imgs/test-uuid-123-photo.jpg",
      image_alt: "alt text",
      link: "/page1",
    };
    mockPrisma.sliders.create.mockResolvedValue(newSlider);

    const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("image_alt", "alt text");
    formData.append("link", "/page1");

    const req = new Request("http://localhost/api/landingPage/sliders", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(newSlider);
    expect(mockPrisma.sliders.create).toHaveBeenCalled();
  });

  it("should return 400 when file is missing", async () => {
    const formData = new FormData();
    formData.append("link", "/page1");

    const req = new Request("http://localhost/api/landingPage/sliders", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("الزامی");
  });

  it("should return 400 when link is missing", async () => {
    const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", file);

    const req = new Request("http://localhost/api/landingPage/sliders", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    await res.json();

    expect(res.status).toBe(400);
  });

  it("should return 500 on error", async () => {
    mockPrisma.sliders.create.mockRejectedValue(new Error("DB error"));

    const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("link", "/page1");

    const req = new Request("http://localhost/api/landingPage/sliders", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    await res.json();

    expect(res.status).toBe(500);
  });
});
