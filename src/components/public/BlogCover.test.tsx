import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import BlogCover from "./BlogCover";

describe("BlogCover", () => {
  it("marks a prioritized cover as a high-priority fetch", () => {
    render(
      <BlogCover
        src="/article.webp"
        alt="Article cover"
        width={1200}
        height={630}
        priority
        sizes="(min-width: 1024px) 65vw, calc(100vw - 88px)"
      />
    );

    const image = screen.getByRole("img", { name: "Article cover" });
    expect(image).toHaveAttribute("fetchpriority", "high");
    expect(image).toHaveAttribute("sizes", "(min-width: 1024px) 65vw, calc(100vw - 88px)");
  });
});
