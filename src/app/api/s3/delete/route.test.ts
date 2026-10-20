import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAuth, findUnique, deleteObject, listObjectsV2, deleteObjects } = vi.hoisted(() => ({
  requireAuth: vi.fn(),
  findUnique: vi.fn(),
  deleteObject: vi.fn(),
  listObjectsV2: vi.fn(),
  deleteObjects: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireAuth }));
vi.mock("@/lib/prisma", () => ({ prisma: { product: { findUnique } } }));
vi.mock("aws-sdk", () => ({
  S3: class {
    deleteObject = deleteObject;
    listObjectsV2 = listObjectsV2;
    deleteObjects = deleteObjects;
  },
}));

import { DELETE } from "./route";

const request = () =>
  new Request("http://localhost/api/s3/delete", {
    method: "DELETE",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ type: "categoryBanner", key: "qa-test.webp" }),
  });

describe("media deletion permissions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    deleteObject.mockReturnValue({ promise: async () => ({}) });
  });

  it("rejects unauthenticated deletion before touching storage or the database", async () => {
    requireAuth.mockResolvedValue(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    expect((await DELETE(request())).status).toBe(401);
    expect(deleteObject).not.toHaveBeenCalled();
    expect(findUnique).not.toHaveBeenCalled();
  });

  it("rejects branch accounts from deleting admin-managed media", async () => {
    requireAuth.mockResolvedValue({ userId: "qa", role: "Branch" });
    expect((await DELETE(request())).status).toBe(403);
    expect(deleteObject).not.toHaveBeenCalled();
  });

  it("lets an admin delete the requested category image", async () => {
    requireAuth.mockResolvedValue({ userId: "qa", role: "Admin" });
    expect((await DELETE(request())).status).toBe(200);
    expect(deleteObject).toHaveBeenCalledWith(
      expect.objectContaining({ Key: "categoryBanners/qa-test.webp" })
    );
  });
});
