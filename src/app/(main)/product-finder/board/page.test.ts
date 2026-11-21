import { describe, expect, it } from "vitest";

import { metadata } from "./page";

describe("product finder board metadata", () => {
  it("identifies the user-state board and excludes it from search results", () => {
    expect(metadata.title).toContain("میز تصمیم");
    expect(metadata.alternates?.canonical).toBe("/product-finder/board");
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });
});
