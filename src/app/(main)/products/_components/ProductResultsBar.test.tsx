import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ProductResultsBar from "./ProductResultsBar";

describe("ProductResultsBar", () => {
  it("announces the visible result count and keeps the search route discoverable", () => {
    render(<ProductResultsBar resultCount={12} totalCount={36} currentPage={2} />);

    expect(screen.getByText("۱۲ نتیجه در این صفحه")).toBeVisible();
    expect(screen.getByText("۳۶ محصول در کاتالوگ")).toBeVisible();
    expect(screen.getByRole("link", { name: "جستجوی محصول" })).toHaveAttribute(
      "href",
      "/products/search"
    );
  });
});
