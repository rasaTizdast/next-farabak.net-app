import { NextRequest, NextResponse } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));

vi.mock("@/lib/auth", () => ({ requireAuth: auth }));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("aws-sdk", () => ({
  S3: vi.fn().mockImplementation(function () {
    return {};
  }),
}));

import { POST as createShowcaseProduct } from "../landingPage/showcase_products/route";
import { POST as createSlider } from "../landingPage/sliders/route";
import { POST as createMember } from "../members/create/route";
import { PUT as updateMember } from "../members/update/route";
import { PUT as updateProject } from "../projects/[id]/route";
import { POST as createProject } from "../projects/route";

const handlers = [
  ["member creation", (request: Request) => createMember(request)],
  ["member update", (request: Request) => updateMember(request)],
  ["landing slider creation", (request: Request) => createSlider(request)],
  ["showcase product creation", (request: Request) => createShowcaseProduct(request)],
  ["project creation", (request: Request) => createProject(request as NextRequest)],
  [
    "project update",
    (request: Request) =>
      updateProject(request as NextRequest, { params: Promise.resolve({ id: "1" }) }),
  ],
] as const;

describe("multipart mutation authorization", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.mockResolvedValue(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
  });

  it.each(handlers)("rejects unauthenticated %s before parsing bytes", async (_name, handler) => {
    const request = new Request("http://localhost/api/upload", {
      method: "POST",
      headers: { "content-type": "application/octet-stream" },
      body: "untrusted bytes",
    });

    const response = await handler(request);

    expect(response.status).toBe(401);
  });
});
