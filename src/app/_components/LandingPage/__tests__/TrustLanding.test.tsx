import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/cache", () => ({ io: vi.fn() }));
vi.mock("next/image", () => ({
  default: (props: React.ComponentProps<"img">) => <img alt="" {...props} />,
}));
vi.mock("@/lib/data/homepage", () => ({
  getHomepageData: vi.fn().mockResolvedValue({
    blogs: [],
    projects: [],
    publishedProjectCount: null,
  }),
}));
vi.mock("../LandingExperience", () => ({ default: () => null }));
vi.mock("../RangeInstrument", () => ({
  default: () => <div data-testid="range-instrument" />,
}));

import TrustLanding from "../TrustLanding";

describe("TrustLanding", () => {
  it("uses the shared public reading grid without hiding the first readable frame", async () => {
    const { container } = render(<TrustLanding />);

    await waitFor(() => expect(screen.getByRole("heading", { level: 1 })).toBeVisible());

    expect(container.querySelectorAll('[class*="max-w-[1900px]"]').length).toBe(0);
    expect(container.querySelectorAll('[class*="max-w-[1580px]"]').length).toBeGreaterThan(5);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("برای هر نگاه،");
    expect(screen.getByRole("link", { name: /حوزه خود را انتخاب کنید/ })).toHaveAttribute(
      "href",
      "#range-select"
    );
  });
});
