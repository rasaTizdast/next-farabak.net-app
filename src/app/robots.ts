// app/robots.ts
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*", // Applies to all user agents
        allow: "/", // Allow access to all pages
      },
    ],
    sitemap: "https://farabak.net/sitemap.xml", // URL to your sitemap
  };
}
