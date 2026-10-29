import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import SimilarProductsSlider from "./SimilarProductsSlider";

describe("SimilarProductsSlider", () => {
  it("uses the same compact product-card width and FAR metadata as the catalog grid", () => {
    render(
      <SimilarProductsSlider
        title="محصولات مشابه"
        usdRate={50000}
        products={[
          {
            ProductId: 42,
            Type: "دوربین شبکه‌ای",
            img1: "/camera-mini.webp",
            link: "cctv/network-camera/alpha",
            Price: "120",
            Discount: "20",
          },
        ]}
      />
    );

    const card = screen.getByRole("article");
    expect(card).toHaveClass("group");
    expect(screen.getByText("FAR-42")).toBeVisible();
    expect(card.parentElement).toHaveClass("w-[min(100%,300px)]");
  });
});
