import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProductCard from "./ProductCard";

describe("ProductCard", () => {
  it("keeps the product destination, readable name, and bidi-safe code visible", () => {
    render(
      <ProductCard
        product={{
          ProductId: 42,
          Type: "دوربین شبکه‌ای",
          Name: null,
          Price: "120",
          Discount: "20",
          Available: true,
          img1: "camera.webp",
          link: "cctv/network-camera/alpha",
        }}
        usdRate={50000}
        isValidRate
      />
    );

    expect(screen.getByRole("link", { name: /دوربین شبکه‌ای/ })).toHaveAttribute(
      "href",
      "/products/cctv/network-camera/alpha"
    );
    expect(screen.getByText("کد محصول: 42")).toBeVisible();
    expect(screen.getAllByText(/تومان/)).toHaveLength(2);
  });

  it("falls back to contact copy when a usable price is unavailable", () => {
    render(
      <ProductCard
        product={{
          ProductId: 43,
          Type: null,
          Name: "تجهیزات امنیتی",
          Price: null,
          Discount: null,
          Available: true,
          img1: null,
          link: "security/kit/item",
        }}
        usdRate={null}
        isValidRate={false}
      />
    );

    expect(screen.getByRole("heading", { level: 2, name: "تجهیزات امنیتی" })).toBeVisible();
    expect(screen.getByText("برای قیمت تماس بگیرید")).toBeVisible();
  });
});
