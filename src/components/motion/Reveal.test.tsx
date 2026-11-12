import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { Reveal } from "./Reveal";

class IntersectionObserverStub {
  static instances: IntersectionObserverStub[] = [];
  observe = vi.fn();
  disconnect = vi.fn();
  unobserve = vi.fn();

  constructor() {
    IntersectionObserverStub.instances.push(this);
  }
}

describe("Reveal", () => {
  afterEach(() => {
    IntersectionObserverStub.instances = [];
    vi.unstubAllGlobals();
  });

  it("keeps SSR content visible and cleans up its viewport observer", () => {
    vi.stubGlobal("IntersectionObserver", IntersectionObserverStub);
    Object.defineProperty(window, "IntersectionObserver", {
      configurable: true,
      value: IntersectionObserverStub,
    });

    const { unmount } = render(
      <Reveal>
        <p>محتوای بدون جاوااسکریپت</p>
      </Reveal>
    );

    expect(screen.getByText("محتوای بدون جاوااسکریپت")).toBeVisible();
    expect(IntersectionObserverStub.instances[0]?.observe).toHaveBeenCalled();

    unmount();

    expect(IntersectionObserverStub.instances[0]?.disconnect).toHaveBeenCalled();
  });
});
