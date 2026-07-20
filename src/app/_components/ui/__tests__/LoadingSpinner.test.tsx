import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import LoadingSpinner from "../LoadingSpinner";

describe("LoadingSpinner", () => {
  it("renders without crashing", () => {
    const { container } = render(<LoadingSpinner />);
    expect(container.firstChild).toBeDefined();
  });

  it("renders a spinning element", () => {
    const { container } = render(<LoadingSpinner />);
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).toBeDefined();
  });

  it("renders a centered container", () => {
    const { container } = render(<LoadingSpinner />);
    const outer = container.querySelector(".flex.h-full.items-center.justify-center");
    expect(outer).toBeDefined();
  });
});
