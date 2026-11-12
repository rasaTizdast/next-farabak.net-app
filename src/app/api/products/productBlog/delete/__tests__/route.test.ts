import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockDeleteObject } = vi.hoisted(() => ({
  mockDeleteObject: vi.fn().mockReturnValue({ promise: vi.fn().mockResolvedValue({}) }),
}));

vi.mock("aws-sdk", () => ({
  S3: vi.fn().mockImplementation(function () {
    return {
      deleteObject: mockDeleteObject,
    };
  }),
}));

import { DELETE } from "../route";

describe("DELETE /api/products/productBlog/delete", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete file successfully", async () => {
    const req = new Request("http://localhost/api/products/productBlog/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "productImages/slug/productBlog/test.png" }),
    });

    const res = await DELETE(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.success).toBe(true);
    expect(mockDeleteObject).toHaveBeenCalledWith({
      Bucket: process.env.LIARA_BUCKET_NAME,
      Key: "productImages/slug/productBlog/test.png",
    });
  });

  it("should return 500 on S3 delete error", async () => {
    mockDeleteObject.mockReturnValue({
      promise: vi.fn().mockRejectedValue(new Error("S3 error")),
    });

    const req = new Request("http://localhost/api/products/productBlog/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key: "productImages/slug/productBlog/test.png" }),
    });

    const res = await DELETE(req);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to delete image");
  });
});
