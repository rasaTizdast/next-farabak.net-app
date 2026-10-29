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

  it("keeps the single banner presentation free of a thumbnail chooser", () => {
    render(<ProductGallery title="دوربین شبکه‌ای" images={[null]} />);

    expect(screen.queryByRole("list", { name: "انتخاب تصویر" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /تصویر اصلی/ })).not.toBeInTheDocument();
  });

  it("reserves a landscape frame for the product banner", () => {
    render(<ProductGallery title="دوربین شبکه‌ای" images={["/banner.webp"]} />);

    const image = screen.getByRole("img", { name: "تصویر دوربین شبکه‌ای" });
    expect(image.parentElement).toHaveClass("aspect-video");
  });

  it("keeps the banner in the single outer media panel", () => {
    render(<ProductGallery title="دوربین شبکه‌ای" images={["/banner.webp"]} />);

    const gallery = screen.getByRole("region", { name: "تصاویر دوربین شبکه‌ای" });
    const image = screen.getByRole("img", { name: "تصویر دوربین شبکه‌ای" });

    expect(image.parentElement?.parentElement).toBe(gallery);
  });

  it("stretches its panel when it shares a hero row with product details", () => {
    render(<ProductGallery title="دوربین شبکه‌ای" images={["/banner.webp"]} />);

    const gallery = screen.getByRole("region", { name: "تصاویر دوربین شبکه‌ای" });
    expect(gallery).toHaveClass("h-full");
    expect(imageFrame(gallery)).toHaveClass("h-full");
  });
});

function imageFrame(gallery: HTMLElement) {
  return gallery.querySelector(":scope > div") as HTMLElement;
}
