import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { GET } from "./route";

function makeRequest(url: string) {
  return new NextRequest(new Request(url));
}

function makeContext(slug: string[]) {
  return { params: Promise.resolve({ slug }) };
}

describe("GET /markdown", () => {
  it("serves the homepage markdown with the correct content type and Vary header", async () => {
    const res = await GET(makeRequest("https://farabak.net/markdown"), makeContext([]));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(res.headers.get("Vary")).toContain("Accept");
    const body = await res.text();
    expect(body.startsWith("# ")).toBe(true);
  });

  it("serves markdown for known subpages", async () => {
    for (const slug of [["products"], ["about-us"], ["contact-us"], ["privacy"], ["support"]]) {
      const res = await GET(
        makeRequest(`https://farabak.net/markdown/${slug[0]}`),
        makeContext(slug)
      );
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    }
  });

  it("returns 404 with a markdown recovery body for unknown paths", async () => {
    const res = await GET(
      makeRequest("https://farabak.net/markdown/does-not-exist"),
      makeContext(["does-not-exist"])
    );

    expect(res.status).toBe(404);
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    const body = await res.text();
    expect(body).toContain("/sitemap.xml");
    expect(body).toContain("/llms.txt");
  });
});
