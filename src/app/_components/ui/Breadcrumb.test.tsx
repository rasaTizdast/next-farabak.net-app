import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import Breadcrumb from "./Breadcrumb";

vi.mock("@/lib/data/breadcrumbs", () => ({
  getBreadcrumbNames: vi.fn().mockResolvedValue({}),
}));

describe("Breadcrumb JSON-LD", () => {
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
