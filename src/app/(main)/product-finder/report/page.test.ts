import { describe, expect, it } from "vitest";

import { metadata } from "./page";

describe("product finder report metadata", () => {
  it("identifies the user-state report and excludes it from search results", () => {
    expect(metadata.title).toContain("گزارش انتخاب");
    expect(metadata.alternates?.canonical).toBe("/product-finder/report");
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });
});
