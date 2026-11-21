import { describe, expect, it } from "vitest";

import { metadata } from "./page";

describe("product finder metadata", () => {
  it("sets a route-specific canonical and social identity", () => {
    expect(metadata.alternates?.canonical).toBe("/product-finder");
    expect(metadata.openGraph?.url).toBe("/product-finder");
    expect(metadata.twitter?.title).toContain("راهنمای انتخاب محصول");
  });
});
