import { describe, expect, it } from "vitest";

import { metadata } from "./page";

describe("homepage Open Graph metadata", () => {
  it("includes a working site fallback image for social previews", () => {
    expect(metadata.openGraph?.images).toEqual(["/opengraph-image.webp"]);
  });
});
