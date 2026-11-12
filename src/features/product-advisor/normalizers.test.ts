import { describe, expect, it } from "vitest";

import { normalizeAdvisorSpecs } from "./normalizers";

describe("normalizeAdvisorSpecs", () => {
  it("keeps a normalized value only when it has a matching verified source row", () => {
    const specs = normalizeAdvisorSpecs(
      [
        { Name: "دید در شب", Title: null, Description: "رنگی" },
        { Name: "رزولوشن", Title: null, Description: null },
      ],
      [
        { key: "night-detail", label: "جزئیات شب", sourceLabels: ["دید در شب"] },
        { key: "resolution", label: "رزولوشن", sourceLabels: ["رزولوشن"] },
      ]
    );

    expect(specs).toEqual([
      {
        key: "night-detail",
        label: "جزئیات شب",
        value: "رنگی",
        sourceLabel: "دید در شب",
      },
    ]);
  });
});
