import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { searchProductsMock, getUsdToRialRateMock } = vi.hoisted(() => ({
  searchProductsMock: vi.fn(),
  getUsdToRialRateMock: vi.fn(),
}));

vi.mock("@/lib/data/products", () => ({ searchProducts: searchProductsMock }));
vi.mock("@/lib/data/usd2rial", () => ({ getUsdToRialRate: getUsdToRialRateMock }));
vi.mock("../_components/BreadcrumbWrapper", () => ({ default: () => null }));
vi.mock("../_components/ProductGridWrapper", () => ({ default: () => null }));

import SearchPage, { generateMetadata } from "./page";

describe("product search empty query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows a headed empty-query state without searching for blank input", async () => {
    const page = await SearchPage({ searchParams: Promise.resolve({ q: "   " }) });
    render(page);

    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("عبارت جستجو را وارد کنید");
    expect(searchProductsMock).not.toHaveBeenCalled();
    expect(getUsdToRialRateMock).not.toHaveBeenCalled();
  });

  it("does not inherit the homepage canonical for noindex search results", async () => {
    const metadata = await generateMetadata({ searchParams: Promise.resolve({ q: "دوربین" }) });

    expect(metadata.title).not.toContain('""');
    expect(metadata.alternates?.canonical).toBe("/products/search");
    expect(metadata.robots).toMatchObject({ index: false, follow: true });
  });
});
