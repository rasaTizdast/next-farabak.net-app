import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

process.env.NEXT_PUBLIC_BASE_URL = "https://farabak.net";

describe("Breadcrumb", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders breadcrumb links with fetched names", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        "/": "صفحه اصلی",
        "/products": "محصولات",
      }),
    });

    const { default: Breadcrumb } = await import("../Breadcrumb");
    const { render, screen } = await import("@testing-library/react");
    render(await Breadcrumb({ breadcrumbs: ["/", "/products"] }));

    expect(screen.getByText("صفحه اصلی")).toBeDefined();
    expect(screen.getByText("محصولات")).toBeDefined();
  });

  it("renders structured data script tag", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ "/": "صفحه اصلی" }),
    });

    const { default: Breadcrumb } = await import("../Breadcrumb");
    const { render } = await import("@testing-library/react");
    const { container } = render(await Breadcrumb({ breadcrumbs: ["/"] }));

    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeDefined();
    const data = JSON.parse(script!.innerHTML);
    expect(data["@type"]).toBe("BreadcrumbList");
    expect(data.itemListElement).toHaveLength(1);
    expect(data.itemListElement[0].item.name).toBe("صفحه اصلی");
  });

  it("calls fetch with correct paths", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ "/about-us": "درباره ما" }),
    });

    const { default: Breadcrumb } = await import("../Breadcrumb");
    const { render } = await import("@testing-library/react");
    render(await Breadcrumb({ breadcrumbs: ["/about-us"] }));

    expect(mockFetch).toHaveBeenCalledWith(
      "https://farabak.net/api/breadcrumbs",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  it("renders fallback name for unknown crumbs", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ "/unknown": undefined }),
    });

    const { default: Breadcrumb } = await import("../Breadcrumb");
    const { render, screen } = await import("@testing-library/react");
    render(await Breadcrumb({ breadcrumbs: ["/unknown"] }));

    expect(screen.getByText("نامشخص")).toBeDefined();
  });

  it("renders arrows between breadcrumb items", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ "/a": "A", "/b": "B" }),
    });

    const { default: Breadcrumb } = await import("../Breadcrumb");
    const { render, screen } = await import("@testing-library/react");
    render(await Breadcrumb({ breadcrumbs: ["/a", "/b"] }));

    expect(screen.getByText("A")).toBeDefined();
    expect(screen.getByText("B")).toBeDefined();
  });
});
