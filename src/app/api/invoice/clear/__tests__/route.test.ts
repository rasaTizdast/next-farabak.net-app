import { describe, it, expect, vi, beforeEach } from "vitest";

import { POST } from "../route";

describe("POST /api/invoice/clear", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 200 with success message", async () => {
    const res = await POST();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(json.message).toContain("cleared");
  });

  it("deletes the invoiceData cookie", async () => {
    const res = await POST();
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("invoiceData");
  });
});
