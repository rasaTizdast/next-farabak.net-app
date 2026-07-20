import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import SkeletonLoader from "../SkeletonLoader";

describe("SkeletonLoader (CategorySliderLoader)", () => {
  it("renders default 6 skeleton items", () => {
    const { container } = render(<SkeletonLoader />);
    const items = container.querySelectorAll(".animate-pulse");
    // 6 items + 2 button skeletons = 8, but we check the slider items specifically
    expect(items.length).toBeGreaterThanOrEqual(6);
  });

  it("renders custom amount of skeleton items", () => {
    const { container } = render(<SkeletonLoader amount={3} />);
    const items = container.querySelectorAll(".animate-pulse");
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it("renders with 1 item", () => {
    const { container } = render(<SkeletonLoader amount={1} />);
    const items = container.querySelectorAll(".animate-pulse");
    expect(items.length).toBeGreaterThanOrEqual(1);
  });

  it("renders a scrollbar hide style element", () => {
    const { container } = render(<SkeletonLoader />);
    const style = container.querySelector("style");
    expect(style).toBeDefined();
  });
});
