import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import Breadcrumb from "./Breadcrumb";

vi.mock("@/lib/data/breadcrumbs", () => ({
  getBreadcrumbNames: vi.fn().mockResolvedValue({}),
}));

describe("Breadcrumb JSON-LD", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("normalizes absolute breadcrumb destinations when the base URL ends with a slash", async () => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://farabak.net/");
    const element = await Breadcrumb({ breadcrumbs: ["/", "/products"] });
    const html = renderToStaticMarkup(element);
    const scriptContent = html.match(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/
    )?.[1];
    const items = JSON.parse(scriptContent || "null").itemListElement;

    expect(items.map((item: { item: { "@id": string; url: string } }) => item.item["@id"])).toEqual(
      ["https://farabak.net/", "https://farabak.net/products"]
    );
    expect(items.map((item: { item: { url: string } }) => item.item.url)).toEqual([
      "https://farabak.net/",
      "https://farabak.net/products",
    ]);
  });

  it("escapes script-breaking breadcrumb labels inside one JSON-LD script", async () => {
    const label = "</script><script>alert(1)</script>";
    const element = await Breadcrumb({ breadcrumbs: ["/"], labels: { "/": label } });
    const html = renderToStaticMarkup(element);
    const scripts = html.match(
      /<script\b[^>]*type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g
    );

    expect(scripts).toHaveLength(1);
    const scriptContent = scripts?.[0]?.replace(/^<script[^>]*>/, "").replace(/<\/script>$/, "");
    expect(scriptContent).not.toContain("</script>");
    expect(JSON.parse(scriptContent || "null").itemListElement[0].item.name).toBe(label);
  });
});
