import { beforeAll, describe, expect, it, vi } from "vitest";

let notFoundResponse: (method: string) => Response;

beforeAll(async () => {
  vi.stubEnv("JWT_SECRET", "test-secret");
  vi.stubEnv("REFRESH_TOKEN_SECRET", "test-refresh-secret");
  ({ notFoundResponse } = await import("./proxy"));
});

describe("product route 404 response", () => {
  it("keeps the 404 status and original illustration", async () => {
    const response = notFoundResponse("GET");
    const html = await response.text();

    expect(response.status).toBe(404);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(response.headers.get("X-Robots-Tag")).toBe("noindex");
    expect(html).toContain('<img src="/404.png"');
    expect(html).toContain('name="viewport"');
    expect(html).toContain('href="/products"');
  });

  it("sends no body for HEAD", async () => {
    const response = notFoundResponse("HEAD");
    expect(response.status).toBe(404);
    expect(await response.text()).toBe("");
  });
});
