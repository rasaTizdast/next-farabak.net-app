import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPutObject } = vi.hoisted(() => ({
  mockPutObject: vi.fn().mockReturnValue({ promise: vi.fn().mockResolvedValue({}) }),
}));

vi.mock("aws-sdk", () => ({
  S3: vi.fn().mockImplementation(function () {
    return {
      putObject: mockPutObject,
    };
  }),
}));

import { POST } from "../route";

describe("POST /api/products/productBlog/uploadVideo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should upload video successfully", async () => {
    const file = new File(["video content"], "test.mp4", { type: "video/mp4" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", "my-product");

    const req = new Request("http://localhost/api/products/productBlog/uploadVideo", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.url).toContain("my-product");
    expect(mockPutObject).toHaveBeenCalled();
  });

  it("should return 400 when no file provided", async () => {
    const formData = new FormData();
    formData.append("slug", "my-product");

    const req = new Request("http://localhost/api/products/productBlog/uploadVideo", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("No file provided");
  });

  it("should return 400 when slug is missing", async () => {
    const file = new File(["video content"], "test.mp4", { type: "video/mp4" });
    const formData = new FormData();
    formData.append("file", file);

    const req = new Request("http://localhost/api/products/productBlog/uploadVideo", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Product slug is required");
  });

  it("should return 500 on S3 upload error", async () => {
    mockPutObject.mockReturnValue({
      promise: vi.fn().mockRejectedValue(new Error("S3 error")),
    });

    const file = new File(["video content"], "test.mp4", { type: "video/mp4" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", "my-product");

    const req = new Request("http://localhost/api/products/productBlog/uploadVideo", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to upload file");
  });
});
