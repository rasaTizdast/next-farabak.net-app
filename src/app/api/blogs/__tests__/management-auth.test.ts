import { NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE as deleteMedia } from "../../manageBlog/delete/route";
import { POST as uploadImage } from "../../manageBlog/upload/route";
import { POST as uploadVideo } from "../../manageBlog/uploadVideo/route";
import { POST as createCategory, DELETE as deleteCategory } from "../categories/route";
import { POST as createBlog } from "../create/route";
import { DELETE as deleteBlog } from "../delete/[id]/route";
import { PUT as updateFaq, DELETE as deleteFaq } from "../faqs/[faqId]/route";
import { POST as createFaq } from "../manage/[blogId]/faqs/route";
import { POST as updateQrCode, DELETE as deleteQrCode } from "../qrCode/route";
import { PATCH as patchBlog, PUT as updateContent } from "../update/[id]/route";

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));
vi.mock("@/lib/auth", () => ({ requireAuth: auth }));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("aws-sdk", () => ({
  S3: vi.fn().mockImplementation(function () {
    return {};
  }),
}));

const idParams = { params: Promise.resolve({ id: "1" }) };
const handlers = [
  ["create", createBlog],
  ["metadata update", (req: Request) => patchBlog(req, idParams)],
  ["content update", (req: Request) => updateContent(req, idParams)],
  ["delete", (req: Request) => deleteBlog(req, idParams)],
  ["create category", createCategory],
  ["delete category", deleteCategory],
  ["upload cover", uploadImage],
  ["upload video", uploadVideo],
  ["delete media", deleteMedia],
  ["create FAQ", (req: Request) => createFaq(req, { params: Promise.resolve({ blogId: "1" }) })],
  ["update FAQ", (req: Request) => updateFaq(req, { params: Promise.resolve({ faqId: "1" }) })],
  ["delete FAQ", (req: Request) => deleteFaq(req, { params: Promise.resolve({ faqId: "1" }) })],
  ["update QR code", updateQrCode],
  ["delete QR code", deleteQrCode],
] as const;

describe("Blog management authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each(handlers)(
    "requires a session for %s before reading or mutating resources",
    async (_name, handler) => {
      auth.mockResolvedValue(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
      const response = await handler(
        new Request("http://localhost/api/blogs/qa", { method: "POST" })
      );
      expect(response.status).toBe(401);
    }
  );

  it.each(handlers)("rejects a Branch role for %s", async (_name, handler) => {
    auth.mockResolvedValue({ userId: "2", username: "qa-branch", role: "Branch" });
    const response = await handler(
      new Request("http://localhost/api/blogs/qa", { method: "POST" })
    );
    expect(response.status).toBe(403);
  });
});
