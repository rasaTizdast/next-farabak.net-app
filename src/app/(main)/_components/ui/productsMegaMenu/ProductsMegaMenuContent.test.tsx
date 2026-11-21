import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/NoPrefetchLink", () => ({
  default: ({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import type { MenuCategory } from "@/helpers/menuHelpers";

import ProductsMegaMenuContent from "./ProductsMegaMenuContent";

const longLabel =
  "خرید دوربین مداربسته حرارتی شبکه‌ای برای پایش محیط‌های صنعتی و کنترل ورودی ساختمان";

const categories: MenuCategory[] = [
  {
    CategoryID: 1,
    Name: "دوربین مداربسته ریولینک",
    Available: true,
    Slug: "reolink-cctv-camera",
    Link: "/products/reolink-cctv-camera",
    Subcategories: [
      {
        CategoryContentId: 10,
        Name: longLabel,
        CategoryID: 1,
        Slug: "thermal",
        Available: true,
        Link: "/products/reolink-cctv-camera/thermal",
      },
    ],
  },
];

describe("ProductsMegaMenuContent", () => {
  it("keeps long subcategory names readable in wrapping links", () => {
    render(
      <ProductsMegaMenuContent
        categoriesWithSubcategories={categories}
        categoriesWithoutSubcategories={[]}
      />
    );

    fireEvent.mouseEnter(screen.getByRole("link", { name: "محصولات" }));

    const link = screen.getByRole("link", { name: longLabel });
    expect(link).toHaveAttribute("href", "/products/reolink-cctv-camera/thermal");
    expect(link).toHaveClass("whitespace-normal");
    expect(link).not.toHaveClass("truncate");
  });
});
