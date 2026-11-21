import { describe, expect, it } from "vitest";

import { createRouteMetadata } from "./route-metadata";

describe("createRouteMetadata", () => {
  it("sets route-specific canonical and matching Open Graph and Twitter identity", () => {
    const metadata = createRouteMetadata({
      title: "ارتباط با فرابک",
      description: "راه‌های تماس با فرابک",
      path: "/contact-us",
    });

    expect(metadata.alternates?.canonical).toBe("/contact-us");
    expect(metadata.openGraph).toMatchObject({
      title: "ارتباط با فرابک",
      description: "راه‌های تماس با فرابک",
      url: "/contact-us",
      siteName: "فرابک",
    });
    expect(metadata.twitter).toMatchObject({
      title: "ارتباط با فرابک",
      description: "راه‌های تماس با فرابک",
      card: "summary_large_image",
    });
  });

  it("uses the supplied share image and accessible image description", () => {
    const metadata = createRouteMetadata({
      title: "درباره فرابک",
      description: "آشنایی با فرابک",
      path: "/about-us",
      image: "/images/about.webp",
      imageAlt: "تیم فرابک",
    });

    expect(metadata.openGraph?.images).toEqual([{ url: "/images/about.webp", alt: "تیم فرابک" }]);
    expect(metadata.twitter?.images).toEqual(["/images/about.webp"]);
  });
});
