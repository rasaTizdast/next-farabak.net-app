import { render } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import SkeletonLoader from "../SkeletonLoader";

describe("SkeletonLoader (CategorySliderLoader)", () => {
  it.each([
    { amount: undefined, expected: 6 },
    { amount: 3, expected: 3 },
    { amount: 1, expected: 1 },
  ])("renders $expected slider placeholders when amount is $amount", ({ amount, expected }) => {
    const { container } = render(<SkeletonLoader amount={amount} />);
    const items = container.querySelectorAll(".scrollbar-hide > *");

    expect(items).toHaveLength(expected);
    for (const item of items) {
      expect(item.querySelector(".skeleton-shimmer")).toBeInTheDocument();
    }
  });

  it("renders a scrollbar hide style element", () => {
    const { container } = render(<SkeletonLoader />);
    const style = container.querySelector("style");
    expect(style).toBeDefined();
  });
});
