import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { MotionConfig } from "./MotionConfig";

describe("MotionConfig", () => {
  it("keeps motion content readable when reduced motion is requested", () => {
    window.matchMedia = () =>
      ({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        addListener: () => undefined,
        removeListener: () => undefined,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
        dispatchEvent: () => false,
      }) as MediaQueryList;

    render(
      <MotionConfig>
        <p>محتوای قابل خواندن</p>
      </MotionConfig>
    );

    expect(screen.getByText("محتوای قابل خواندن")).toBeVisible();
  });
});
