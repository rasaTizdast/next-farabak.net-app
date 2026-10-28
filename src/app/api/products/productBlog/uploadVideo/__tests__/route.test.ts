import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth, getSignedUrl } = vi.hoisted(() => ({
  auth: vi.fn(),
  getSignedUrl: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAuth: auth }));
vi.mock("aws-sdk", () => ({
  S3: vi.fn().mockImplementation(function () {
    return { getSignedUrlPromise: getSignedUrl };
  }),
}));

import { POST } from "../route";

describe("POST /api/products/productBlog/uploadVideo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ userId: "1", username: "admin", role: "Admin" });
    getSignedUrl.mockResolvedValue("https://uploads.example.test/signed");
  });

  it("returns a direct S3 upload URL without accepting video bytes", async () => {
    const req = new Request("http://localhost/api/products/productBlog/uploadVideo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug: "my-product",
        fileName: "demo clip.mp4",
        contentType: "video/mp4",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      uploadUrl: "https://uploads.example.test/signed",
      url: "productImages/my-product/productBlogVideos/demo-clip.mp4",
    });
  });

  it("rejects an unauthenticated request before parsing its body", async () => {
    auth.mockResolvedValue(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    const req = new Request("http://localhost/api/products/productBlog/uploadVideo", {
      method: "POST",
      headers: { "content-type": "application/octet-stream" },
      body: "untrusted bytes",
    });

    const res = await POST(req);

    expect(res.status).toBe(401);
  });

  it("rejects non-video content types", async () => {
    const req = new Request("http://localhost/api/products/productBlog/uploadVideo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug: "my-product",
        fileName: "payload.bin",
        contentType: "application/octet-stream",
      }),
    });

    const res = await POST(req);

    expect(res.status).toBe(400);
  });
});
