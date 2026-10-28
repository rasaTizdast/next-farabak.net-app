import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProductGallery from "./ProductGallery";

describe("ProductGallery", () => {
  it("keeps a labelled media fallback visible when product imagery is unavailable", () => {
    render(<ProductGallery title="دوربین شبکه‌ای" images={[null, null]} />);

    expect(screen.getByRole("img", { name: "تصویر محصول موجود نیست" })).toBeVisible();
    expect(screen.getByRole("button", { name: "تصویر اصلی دوربین شبکه‌ای" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });
});
