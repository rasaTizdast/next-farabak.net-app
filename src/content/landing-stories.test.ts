import { describe, expect, it } from "vitest";

import { landingAssets } from "./landing-assets";
import { landingStories } from "./landing-stories";

describe("landing stories", () => {
  it("sends every primary story CTA to its category route", () => {
    for (const story of landingStories) {
      expect(story.action.href).toBe(story.categoryHref);
      expect(story.action.href).toMatch(/^\/products(?:\/|$)/);
    }
  });

  it("uses WebP landing media and neutral public captions", () => {
    const publicCopy = [
      ...landingStories.flatMap((story) => [
        story.solution.beforeModel,
        story.solution.afterModel ?? "",
      ]),
      ...Object.values(landingAssets).flatMap((asset) => [asset.caption, asset.alt]),
    ].join(" ");

    expect(publicCopy).not.toMatch(
      /هوش مصنوعی|تأیید نشده|تایید نشده|نمونه بصری|عکس رسمی|نصب واقعی/
    );

    for (const asset of Object.values(landingAssets)) {
      expect(asset.desktopSrc).toMatch(/\.webp$/);
      expect(asset.mobileSrc).toMatch(/\.webp$/);
    }
  });
});
