import { NextResponse } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { auth, mockPutObject } = vi.hoisted(() => ({
  auth: vi.fn(),
  mockPutObject: vi.fn().mockReturnValue({ promise: vi.fn().mockResolvedValue({}) }),
}));

vi.mock("@/lib/auth", () => ({ requireAuth: auth }));
vi.mock("aws-sdk", () => ({
  S3: vi.fn().mockImplementation(function () {
    return {
      putObject: mockPutObject,
    };
  }),
}));

import { POST } from "../route";

describe("POST /api/products/productBlog/upload", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ userId: "1", username: "admin", role: "Admin" });
  });

  it("rejects an unauthenticated request before parsing its body", async () => {
    auth.mockResolvedValue(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    const req = new Request("http://localhost/api/products/productBlog/upload", {
      method: "POST",
      headers: { "content-type": "application/octet-stream" },
      body: "untrusted bytes",
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("should upload file successfully", async () => {
    const file = new File(["test content"], "test.png", { type: "image/png" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", "my-product");

    const req = new Request("http://localhost/api/products/productBlog/upload", {
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

    const req = new Request("http://localhost/api/products/productBlog/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("No file provided");
  });

  it("should return 400 when slug is missing", async () => {
    const file = new File(["test content"], "test.png", { type: "image/png" });
    const formData = new FormData();
    formData.append("file", file);

    const req = new Request("http://localhost/api/products/productBlog/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toBe("Blog slug is required");
  });

  it("should return 500 on S3 upload error", async () => {
    mockPutObject.mockReturnValue({
      promise: vi.fn().mockRejectedValue(new Error("S3 error")),
    });

    const file = new File(["test content"], "test.png", { type: "image/png" });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("slug", "my-product");

    const req = new Request("http://localhost/api/products/productBlog/upload", {
      method: "POST",
      body: formData,
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to upload file");
  });
});
