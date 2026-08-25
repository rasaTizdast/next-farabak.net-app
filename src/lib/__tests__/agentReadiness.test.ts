import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import robotsRoute from "@/app/robots";

const robots = robotsRoute();

describe("robots.txt", () => {
  it("explicitly allows the major AI agent user agents", () => {
    const rules = Array.isArray(robots.rules) ? robots.rules : [robots.rules];
    const agentAgents = [
      "ChatGPT-User",
      "GPTBot",
      "ClaudeBot",
      "Google-Extended",
      "DeepSeekBot",
      "PerplexityBot",
      "ora-agent",
    ];

    for (const agent of agentAgents) {
      const rule = rules.find((r) => r.userAgent === agent);
      expect(rule, `missing robots rule for ${agent}`).toBeDefined();
      expect(rule?.allow).toBe("/");
    }
  });

  it("still allows everyone and protects admin routes", () => {
    const rules = Array.isArray(robots.rules) ? robots.rules : [robots.rules];
    const wildcard = rules.find((r) => r.userAgent === "*");
    expect(wildcard?.allow).toBe("/");
    expect(JSON.stringify(wildcard?.disallow)).toContain("/admin/");
  });

  it("points at the sitemap", () => {
    expect(robots.sitemap).toBe("https://farabak.net/sitemap.xml");
  });
});

describe("llms.txt", () => {
  const llmsTxt = readFileSync(path.join(process.cwd(), "public/llms.txt"), "utf8");

  it("follows the llmstxt.org format (H1 title + blockquote summary)", () => {
    expect(llmsTxt.startsWith("# ")).toBe(true);
    expect(llmsTxt).toContain("\n> ");
  });

  it("contains when-to-use guidance for agents", () => {
    expect(llmsTxt).toContain("When to use this site");
  });

  it("lists developer resources by name", () => {
    expect(llmsTxt).toContain("OpenAPI");
    expect(llmsTxt).toContain("/api/swagger");
    expect(llmsTxt).toContain("/swagger");
  });

  it("links the trust anchor pages", () => {
    expect(llmsTxt).toContain("/about-us");
    expect(llmsTxt).toContain("/contact-us");
    expect(llmsTxt).toContain("/privacy");
  });

  it("documents markdown content negotiation", () => {
    expect(llmsTxt).toContain("Accept: text/markdown");
  });
});
