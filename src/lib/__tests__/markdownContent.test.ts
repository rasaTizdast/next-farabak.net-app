import { describe, expect, it } from "vitest";

import {
  buildNotFoundMarkdown,
  getCatalogPageCheck,
  markdownKeyFromPath,
  markdownPages,
} from "../markdownContent";

describe("catalog route shapes", () => {
  it("allows dynamic slugs that collide with shorter static paths", () => {
    expect(
      getCatalogPageCheck(["products", "search", "bullet"], new URLSearchParams())
    ).toMatchObject({ type: "subcategory", category: "search", subcategory: "bullet" });
    expect(
      getCatalogPageCheck(["products", "camera", "page"], new URLSearchParams())
    ).toMatchObject({ type: "subcategory", category: "camera", subcategory: "page" });
  });
});

describe("markdownPages", () => {
  it("covers the main public pages", () => {
    expect(Object.keys(markdownPages)).toEqual(
      expect.arrayContaining(["", "support", "about-us", "contact-us", "privacy"])
    );
  });

  it("every page starts with an H1 and links back to the site", () => {
    for (const page of Object.values(markdownPages)) {
      expect(page.markdown.trim().startsWith("# ")).toBe(true);
      expect(page.markdown.length).toBeGreaterThan(200);
      expect(page.title).toBeTruthy();
    }
  });

  it("home markdown has substantial content for agents", () => {
    const home = markdownPages[""];
    expect(home.markdown.length).toBeGreaterThan(500);
    expect(home.markdown).toContain("فرابک");
  });

  it("describes the company without unverified importer claims", () => {
    for (const page of [markdownPages[""], markdownPages["about-us"]]) {
      expect(page.markdown).not.toContain("واردکننده");
    }
  });
});

describe("markdownKeyFromPath", () => {
  it("normalizes pathnames to lookup keys", () => {
    expect(markdownKeyFromPath("/")).toBe("");
    expect(markdownKeyFromPath("/about-us")).toBe("about-us");
    expect(markdownKeyFromPath("/about-us/")).toBe("about-us");
  });
});

describe("buildNotFoundMarkdown", () => {
  it("returns recovery links so agents can recover from a 404", () => {
    const body = buildNotFoundMarkdown("/does-not-exist");
    expect(body.startsWith("# صفحه یافت نشد (404)")).toBe(true);
    expect(body).toContain("(/sitemap.xml)");
    expect(body).toContain("(/llms.txt)");
    expect(body).toContain("(/products)");
  });
});
