import type { MetadataRoute } from "next";

// Explicitly welcome the major AI agent crawlers so WAFs and bot rules
// that honor robots.txt never treat them as unwanted bots.
const AI_AGENT_USER_AGENTS = [
  "ChatGPT-User",
  "GPTBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "DeepSeekBot",
  "PerplexityBot",
  "Applebot-Extended",
  "CCBot",
  "ora-agent",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      ...AI_AGENT_USER_AGENTS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/admin/", "/dashboard/", "/api/admin/"],
      })),
      {
        userAgent: "*", // Applies to all user agents
        allow: "/", // Allow access to all pages
        disallow: ["/admin/", "/dashboard/"],
      },
    ],
    sitemap: "https://farabak.net/sitemap.xml", // URL to your sitemap
  };
}
