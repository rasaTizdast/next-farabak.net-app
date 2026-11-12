import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    showcase_products: { findMany: vi.fn() },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

vi.mock("next/image", () => ({
  default: (props: any) => <img alt={props.alt} {...props} />,
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("ProductsShowCase", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders showcase products", async () => {
    mockPrisma.showcase_products.findMany.mockResolvedValue([
      {
        id: 1,
        title: "Product 1",
        image: "img1.jpg",
        link: "/p1",
        description: "Desc 1",
        order: 1,
      },
      {
        id: 2,
        title: "Product 2",
        image: "img2.jpg",
        link: "/p2",
        description: "Desc 2",
        order: 2,
      },
    ]);

    const { default: ProductsShowCase } = await import("../ProductsShowCase");
    const { render, screen } = await import("@testing-library/react");
    render(await ProductsShowCase());

    expect(screen.getByText("محصولات رئولینک")).toBeDefined();
    expect(screen.getByText("Product 1")).toBeDefined();
    expect(screen.getByText("Product 2")).toBeDefined();
  });

  it("renders product descriptions", async () => {
    mockPrisma.showcase_products.findMany.mockResolvedValue([
      {
        id: 1,
        title: "Camera",
        image: "cam.jpg",
        link: "/cam",
        description: "HD Camera",
        order: 1,
      },
    ]);

    const { default: ProductsShowCase } = await import("../ProductsShowCase");
    const { render, screen } = await import("@testing-library/react");
    render(await ProductsShowCase());

    expect(screen.getByText("HD Camera")).toBeDefined();
  });

  it("renders product links", async () => {
    mockPrisma.showcase_products.findMany.mockResolvedValue([
      { id: 1, title: "Item", image: "img.jpg", link: "/item", description: "Desc", order: 1 },
    ]);

    const { default: ProductsShowCase } = await import("../ProductsShowCase");
    const { render, screen } = await import("@testing-library/react");
    render(await ProductsShowCase());

    const link = screen.getByText("Item").closest("a");
    expect(link?.getAttribute("href")).toBe("/item");
  });

  it("queries with correct order", async () => {
    mockPrisma.showcase_products.findMany.mockResolvedValue([]);

    const { default: ProductsShowCase } = await import("../ProductsShowCase");
    const { render } = await import("@testing-library/react");
    render(await ProductsShowCase());

    expect(mockPrisma.showcase_products.findMany).toHaveBeenCalledWith({
      orderBy: { order: "asc" },
    });
  });
});
