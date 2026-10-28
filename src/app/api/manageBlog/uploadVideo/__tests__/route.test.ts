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

describe("POST /api/manageBlog/uploadVideo", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue({ userId: "1", username: "admin", role: "Admin" });
    getSignedUrl.mockResolvedValue("https://uploads.example.test/signed");
  });

  it("returns a direct S3 upload URL without accepting video bytes", async () => {
    const req = new Request("http://localhost/api/manageBlog/uploadVideo", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        slug: "launch-news",
        fileName: "factory tour.webm",
        contentType: "video/webm",
      }),
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({
      uploadUrl: "https://uploads.example.test/signed",
      url: "blogVideos/launch-news/factory-tour.webm",
    });
  });
});
