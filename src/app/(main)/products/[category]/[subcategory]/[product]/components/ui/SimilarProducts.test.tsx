import type { ReactElement, ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getProductsByCategoryMock, getProductsBySubcategoryMock, getUsdToRialRateMock } =
  vi.hoisted(() => ({
    getProductsByCategoryMock: vi.fn(),
    getProductsBySubcategoryMock: vi.fn(),
    getUsdToRialRateMock: vi.fn(),
  }));

vi.mock("@/lib/data/products", () => ({
  getProductsByCategory: getProductsByCategoryMock,
  getProductsBySubcategory: getProductsBySubcategoryMock,
}));
vi.mock("@/lib/data/usd2rial", () => ({ getUsdToRialRate: getUsdToRialRateMock }));
vi.mock("./SimilarProductsSlider", () => ({ default: () => null }));

import SimilarProducts from "./SimilarProducts";

describe("similar product structured data", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://farabak.net");
    getProductsBySubcategoryMock.mockResolvedValue({
      data: [
        {
          ProductId: 44,
          Type: "Argus 2",
          img1: "argus-2.png",
          productSlug: "Argus-2",
          link: "reolink-cctv-camera/night-vision/Argus-2",
          Available: true,
          Price: "100",
          Discount: "0",
        },
      ],
    });
    getProductsByCategoryMock.mockResolvedValue({ data: [] });
    getUsdToRialRateMock.mockResolvedValue({ rate: 50000 });
  });

  it("keeps related cards linkable without nesting unrelated Product or Offer entities", async () => {
    const rendered = await SimilarProducts({
      currentProductId: 45,
      currentProductSlug: "RLC-823A",
      categorySlug: "reolink-cctv-camera",
      subCategorySlug: "night-vision",
    });

    expect(rendered).not.toBeNull();
    const children = (rendered as ReactElement<{ children: ReactNode[] }>).props.children;
    const schemaScript = children[0] as ReactElement<{
      dangerouslySetInnerHTML: { __html: string };
    }>;
    const schema = JSON.parse(schemaScript.props.dangerouslySetInnerHTML.__html);

    expect(schema.itemListElement).toEqual([
      {
        "@type": "ListItem",
        position: 1,
        name: "Argus 2",
        url: "https://farabak.net/products/reolink-cctv-camera/night-vision/Argus-2",
      },
    ]);
    expect(JSON.stringify(schema)).not.toContain('"@type":"Product"');
    expect(JSON.stringify(schema)).not.toContain('"@type":"Offer"');
  });
});
