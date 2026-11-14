import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import ProductTabs from "./ProductTabs";

describe("ProductTabs", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exposes navigation links for the sections with content", async () => {
    await act(async () => {
      render(
        <main id="main-content">
          <ProductTabs />
          <section id="overview">
            <div data-product-section-content>Product description</div>
          </section>
          <section id="blog" />
          <section id="specs">
            <div data-product-section-content>Product specifications</div>
          </section>
          <section id="faq">
            <div data-product-section-content>Product FAQs</div>
          </section>
        </main>
      );
    });

    const navigation = screen.getByRole("navigation", { name: "بخش‌های محصول" });
    const links = within(navigation);
    expect(links.getByRole("link", { name: "توضیحات" })).toHaveAttribute("href", "#overview");
    expect(links.getByRole("link", { name: "مشخصات" })).toHaveAttribute("href", "#specs");
    expect(links.getByRole("link", { name: "سوالات" })).toHaveAttribute("href", "#faq");
    expect(links.queryByRole("link", { name: "توضیحات تکمیلی" })).not.toBeInTheDocument();
    expect(navigation).toHaveClass("sticky");
  });

  it("scrolls to the FAQ section when its link is activated with the keyboard", async () => {
    const user = userEvent.setup();
    const scrollTo = vi.spyOn(window, "scrollTo").mockImplementation(() => {});
    await act(async () => {
      render(
        <main id="main-content">
          <ProductTabs />
          <section id="faq" aria-label="Product FAQs">
            <div data-product-section-content>Common product questions</div>
          </section>
        </main>
      );
    });
    const section = screen.getByRole("region", { name: "Product FAQs" });
    vi.spyOn(section, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 400));

    await user.tab();
    expect(screen.getByRole("link", { name: "سوالات" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(scrollTo).toHaveBeenCalledExactlyOnceWith({ top: 380, behavior: "smooth" });
  });
});
