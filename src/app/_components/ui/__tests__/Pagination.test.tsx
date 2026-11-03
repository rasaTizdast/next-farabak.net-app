import { render, screen, within } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import Pagination from "../Pagination";

describe("Pagination (public)", () => {
  it("renders page numbers in desktop section", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={3} basePath="/products" />
    );
    const desktop = container.querySelector(".hidden.sm\\:flex") as HTMLElement;
    expect(desktop).toBeDefined();
    const buttons = within(desktop).getAllByRole("button");
    const pageButtons = buttons.filter((b) => ["1", "2", "3"].includes(b.textContent || ""));
    expect(pageButtons.length).toBe(3);
  });

  it("disables first/prev on first page in desktop", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={5} basePath="/products" />
    );
    const desktop = container.querySelector(".hidden.sm\\:flex") as HTMLElement;
    expect(desktop).toBeDefined();
    const firstBtn = within(desktop).getByText("اولین");
    const prevBtn = within(desktop).getByText("قبلی");
    expect(firstBtn.hasAttribute("disabled")).toBe(true);
    expect(prevBtn.hasAttribute("disabled")).toBe(true);
    expect(desktop.querySelector('a[href="/products/page/0"]')).toBeNull();
  });

  it("disables next/last on last page in desktop", () => {
    const { container } = render(
      <Pagination currentPage={5} totalPages={5} basePath="/products" />
    );
    const desktop = container.querySelector(".hidden.sm\\:flex") as HTMLElement;
    expect(desktop).toBeDefined();
    const nextBtn = within(desktop).getByText("بعدی");
    const lastBtn = within(desktop).getByText("آخرین");
    expect(nextBtn.hasAttribute("disabled")).toBe(true);
    expect(lastBtn.hasAttribute("disabled")).toBe(true);
    expect(desktop.querySelector('a[href="/products/page/6"]')).toBeNull();
  });

  it("does not link before page one or after the last category page", () => {
    const { container } = render(
      <Pagination currentPage={3} totalPages={3} basePath="/products" categorySlug="x-ray" />
    );

    const links = Array.from(container.querySelectorAll("a")).map((link) =>
      link.getAttribute("href")
    );
    expect(links).not.toContain("/products/x-ray/page/0");
    expect(links).not.toContain("/products/x-ray/page/4");
  });

  it("links page one to the listing root instead of a duplicate page/1 URL", () => {
    const { container } = render(
      <Pagination
        currentPage={2}
        totalPages={3}
        basePath="/products"
        categorySlug="x-ray"
        subcategorySlug="airport-luggage"
      />
    );

    const hrefs = Array.from(container.querySelectorAll("a")).map((link) =>
      link.getAttribute("href")
    );

    expect(hrefs).toContain("/products/x-ray/airport-luggage");
    expect(hrefs).not.toContain("/products/x-ray/airport-luggage/page/1");
  });

  it("highlights current page in desktop", () => {
    const { container } = render(
      <Pagination currentPage={2} totalPages={5} basePath="/products" />
    );
    const desktop = container.querySelector(".hidden.sm\\:flex") as HTMLElement;
    expect(desktop).toBeDefined();
    const page2Btn = within(desktop).getByText("2");
    expect(page2Btn.className).toContain("bg-blue-600");
  });

  it("shows ellipsis for many pages", () => {
    render(<Pagination currentPage={5} totalPages={10} basePath="/products" />);
    const ellipses = screen.getAllByText("...");
    expect(ellipses.length).toBeGreaterThanOrEqual(1);
  });

  it("includes category and subcategory in links", () => {
    const { container } = render(
      <Pagination
        currentPage={1}
        totalPages={3}
        basePath="/products"
        categorySlug="electronics"
        subcategorySlug="phones"
      />
    );
    const desktop = container.querySelector(".hidden.sm\\:flex") as HTMLElement;
    expect(desktop).toBeDefined();
    const links = within(desktop).getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    expect(links[0].getAttribute("href")).toContain("electronics");
    expect(links[0].getAttribute("href")).toContain("phones");
  });
});
