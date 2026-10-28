import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import RangeInstrument from "../RangeInstrument";

const items = [
  {
    key: "xray",
    categoryLabel: "بازرسی با اشعه ایکس",
    familyLabel: "HI-SCAN",
    title: "تجهیزات بازرسی",
    href: "/products/x-ray",
    desktopSrc: null,
    mobileSrc: null,
    alt: "تجهیزات بازرسی",
    mediaStatus: "editorial-illustration" as const,
    caption: "تصویر حوزه",
  },
] as const;

describe("RangeInstrument", () => {
  it("uses the shared action focus contract for the active-area link", () => {
    render(<RangeInstrument items={items} />);

    expect(screen.getByRole("link", { name: /دیدن این حوزه/ })).toHaveClass(
      "min-h-11",
      "focus-visible:ring-(--farabak-action-blue)"
    );
  });
});
