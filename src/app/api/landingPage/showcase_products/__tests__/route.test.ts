import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockS3Instance, mockUuid } = vi.hoisted(() => {
  const s3Inst = {
    putObject: vi.fn().mockReturnValue({ promise: vi.fn().mockResolvedValue({}) }),
  };
  return {
    mockPrisma: {
      showcase_products: {
        findMany: vi.fn(),
        create: vi.fn(),
      },
    },
    mockS3Instance: s3Inst,
    mockUuid: vi.fn(() => "test-uuid-456"),
  };
});

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("aws-sdk", () => ({
  S3: class {
    constructor() {}
    putObject(...args: any[]) {
      return mockS3Instance.putObject(...args);
    }
  },
}));
vi.mock("uuid", () => ({ v4: mockUuid }));

import { GET, POST } from "../route";

describe("GET /api/landingPage/showcase_products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return showcase products ordered by order", async () => {
    const products = [
      { id: 1, title: "Product A", order: 1 },
      { id: 2, title: "Product B", order: 2 },
    ];
    mockPrisma.showcase_products.findMany.mockResolvedValue(products);

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(products);
    expect(mockPrisma.showcase_products.findMany).toHaveBeenCalledWith({
      orderBy: { order: "asc" },
    });
  });

  it("should return 500 on error", async () => {
    mockPrisma.showcase_products.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to fetch showcase products");
  });
});

describe("POST /api/landingPage/showcase_products", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create a showcase product with file upload", async () => {
    const newProduct = {
      id: 1,
      title: "Test Product",
      description: "Description",
      order: 1,
      image: "product-showCase/test-uuid-456-photo.jpg",
      link: "/product/1",
    };
    mockPrisma.showcase_products.create.mockResolvedValue(newProduct);

    const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", "Test Product");
    formData.append("description", "Description");
    formData.append("order", "1");
    formData.append("link", "/product/1");

    const req = new Request("http://localhost/api/landingPage/showcase_products", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual(newProduct);
    expect(mockPrisma.showcase_products.create).toHaveBeenCalled();
  });

  it("should return 400 for missing required fields", async () => {
    const formData = new FormData();
    formData.append("title", "Test Product");

    const req = new Request("http://localhost/api/landingPage/showcase_products", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("نامعتبر");
  });

  it("should return 500 on error", async () => {
    mockPrisma.showcase_products.create.mockRejectedValue(new Error("DB error"));

    const file = new File(["content"], "photo.jpg", { type: "image/jpeg" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", "Test Product");
    formData.append("description", "Description");
    formData.append("order", "1");
    formData.append("link", "/product/1");

    const req = new Request("http://localhost/api/landingPage/showcase_products", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
  });
});
