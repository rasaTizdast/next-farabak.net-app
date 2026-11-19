import { describe, expect, it } from "vitest";

import { metadata } from "./not-found";

describe("product 404 metadata", () => {
  it("does not inherit the homepage canonical or index directives", () => {
    expect(metadata.alternates?.canonical).toBeNull();
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    });
  });
});
