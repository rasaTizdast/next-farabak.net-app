import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import Breadcrumb from "../Breadcrumb";

const { mockGetBreadcrumbNames } = vi.hoisted(() => ({
  mockGetBreadcrumbNames: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/data/breadcrumbs", () => ({
  getBreadcrumbNames: mockGetBreadcrumbNames,
}));

process.env.NEXT_PUBLIC_BASE_URL = "https://farabak.net";

describe("Breadcrumb", () => {
  afterEach(() => cleanup());

  beforeEach(() => vi.clearAllMocks());

  it("renders breadcrumb links with resolved names", async () => {
    mockGetBreadcrumbNames.mockResolvedValue({
      "/": "صفحه اصلی",
      "/products": "محصولات",
      "/products/cctv": "دوربین مداربسته",
    });

    render(await Breadcrumb({ breadcrumbs: ["/", "/products", "/products/cctv"] }));

    expect(screen.getByText("صفحه اصلی")).toBeDefined();
    expect(screen.getByText("محصولات")).toBeDefined();
    expect(screen.getByText("دوربین مداربسته")).toBeDefined();
  });

  it("looks up names for category and subcategory paths via the data layer", async () => {
    mockGetBreadcrumbNames.mockResolvedValue({
      "/products/cctv": "دوربین مداربسته",
      "/products/cctv/ptz": "دوربین چرخشی",
    });

    render(await Breadcrumb({ breadcrumbs: ["/products/cctv", "/products/cctv/ptz"] }));

    expect(mockGetBreadcrumbNames).toHaveBeenCalledWith(["/products/cctv", "/products/cctv/ptz"]);
    expect(screen.getByText("دوربین مداربسته")).toBeDefined();
    expect(screen.getByText("دوربین چرخشی")).toBeDefined();
  });

  it("renders structured data script tag", async () => {
    mockGetBreadcrumbNames.mockResolvedValue({ "/": "صفحه اصلی" });

    const { container } = render(await Breadcrumb({ breadcrumbs: ["/"] }));

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeDefined();
    const data = JSON.parse(script!.innerHTML);
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement).toHaveLength(1);
    expect(data.itemListElement[0].item.name).toBe("صفحه اصلی");
  });

  it("renders fallback name for unknown crumbs", async () => {
    mockGetBreadcrumbNames.mockResolvedValue({});

    render(await Breadcrumb({ breadcrumbs: ["/unknown"] }));

    expect(screen.getByText("نامشخص")).toBeDefined();
  });

  it("renders arrows between breadcrumb items", async () => {
    mockGetBreadcrumbNames.mockResolvedValue({ "/a": "A", "/b": "B" });

    render(await Breadcrumb({ breadcrumbs: ["/a", "/b"] }));

    expect(screen.getByText("A")).toBeDefined();
    expect(screen.getByText("B")).toBeDefined();
  });
});
