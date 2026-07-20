import { describe, it, expect } from "vitest";
import { POST } from "../route";

describe("POST /api/auth/logout", () => {
  it("returns 200 with success message", async () => {
    const res = await POST();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.message).toContain("موفقیت");
  });

  it("clears refreshToken cookie", async () => {
    const res = await POST();
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("refreshToken");
  });

  it("clears accessToken cookie", async () => {
    const res = await POST();
    const setCookie = res.headers.get("set-cookie");
    expect(setCookie).toContain("accessToken");
  });
});
