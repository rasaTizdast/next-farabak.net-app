import { NextResponse } from "next/server";
import { describe, expect, it, vi } from "vitest";

const { auth } = vi.hoisted(() => ({ auth: vi.fn() }));

vi.mock("@/lib/auth", () => ({ requireAuth: auth }));

import { POST } from "../route";

describe("POST /api/uploads", () => {
  it("rejects an unauthenticated request before parsing its body", async () => {
    auth.mockResolvedValue(NextResponse.json({ error: "Unauthorized" }, { status: 401 }));
    const req = new Request("http://localhost/api/uploads", {
      method: "POST",
      headers: { "content-type": "application/octet-stream" },
      body: "untrusted bytes",
    });

    const res = await POST(req as never);

    expect(res.status).toBe(401);
  });
});
