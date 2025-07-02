export const dynamic = "force-dynamic";

import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    // Fetch all URLs from our enhanced API endpoint
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/sitemap`
      // { next: { revalidate: 86400 } } // Revalidate every 24 hours (86400 seconds)
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch sitemap data: ${response.status}`);
    }

    const { urls } = await response.json();

    // Map all URLs to the sitemap format
    const sitemapEntries: MetadataRoute.Sitemap = urls.map((url: string) => ({
      url: url,
      lastModified: new Date(),
      changeFrequency: url.includes("/support/blog/") ? "weekly" : "daily",
      priority: getPriority(url),
    }));

    return sitemapEntries;
  } catch (error) {
    console.error("Error generating sitemap:", error);

    // Fallback to minimal sitemap if the API fails
    return [
      {
        url: "https://farabak.net",
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 1.0,
      },
      {
        url: "https://farabak.net/products",
        lastModified: new Date(),
        changeFrequency: "daily",
        priority: 0.9,
      },
      {
        url: "https://farabak.net/support",
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      },
      {
        url: "https://farabak.net/about-us",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
      {
        url: "https://farabak.net/contact-us",
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.7,
      },
    ];
  }
}

// Helper function to determine priority based on URL pattern
function getPriority(url: string): number {
  if (url === "https://farabak.net") {
    return 1.0; // Homepage
  } else if (url === "https://farabak.net/products") {
    return 0.9; // Main product page
  } else if (url.match(/\/products\/[^\/]+$/)) {
    return 0.8; // Category pages
  } else if (url.match(/\/products\/[^\/]+\/[^\/]+$/)) {
    return 0.7; // Subcategory pages
  } else if (url.match(/\/products\/[^\/]+\/[^\/]+\/[^\/]+$/)) {
    return 0.6; // Individual product pages
  } else if (url.includes("/support/blog/")) {
    return 0.7; // Blog posts
  } else if (url.includes("/about-us/projects/")) {
    return 0.6; // Project pages
  } else {
    return 0.5; // Default for other pages
  }
}
