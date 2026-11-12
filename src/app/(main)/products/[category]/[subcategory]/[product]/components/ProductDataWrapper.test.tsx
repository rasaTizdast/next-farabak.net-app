import { isValidElement, type ReactElement, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getProductBySlugMock, ioMock } = vi.hoisted(() => ({
  getProductBySlugMock: vi.fn(),
  ioMock: vi.fn(),
}));

vi.mock("next/cache", () => ({ io: ioMock }));
vi.mock("@/lib/data/products", () => ({ getProductBySlug: getProductBySlugMock }));
vi.mock("@/utils/priceValidUntil", () => ({ getPriceValidUntil: () => "2099-01-01" }));

import ProductDataWrapper from "./ProductDataWrapper";

const validProduct = {
  Available: true,
  ProductId: 9,
  Name: "محصول با مشخصات قابل بررسی",
  Type: "مدل ناشناخته",
  img1: null,
  img2: "products/model.png",
  Price: "100",
  Discount: "10",
  Description: "توضیحات محصول",
  categorySlug: "equipment",
  subCategorySlug: "models",
  productSlug: "Model-9",
  SEO_Title: "",
  SEO_Description: "",
  QrCode_key: "",
  QrCode_expiryDays: "",
  productBlog: "",
};

async function getRenderedProductSchema() {
  const rendered = await ProductDataWrapper({
    params: { category: "equipment", product: "Model-9" },
    searchParams: { key: "" },
  });
  const children = (rendered as ReactElement<{ children: ReactNode[] }>).props.children;
  const script = children.find(
    (child): child is ReactElement<{ dangerouslySetInnerHTML: { __html: string } }> =>
      isValidElement(child) && child.type === "script"
  );

  if (!script) throw new Error("Product JSON-LD script was not rendered");
  return {
    raw: script.props.dangerouslySetInnerHTML.__html,
    schema: JSON.parse(script.props.dangerouslySetInnerHTML.__html),
  };
}

describe("main product structured data", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://farabak.net");
    vi.stubEnv("LIARA_BUCKET_URL", "https://farabaks3.storage.c2.liara.space");
    ioMock.mockResolvedValue(undefined);
    getProductBySlugMock.mockResolvedValue(validProduct);
  });

  it("keeps the primary Product without unsupported price, availability, return, or shipping claims", async () => {
    const { schema } = await getRenderedProductSchema();
    const product = schema["@graph"][0];

    expect(product["@type"]).toBe("Product");
    expect(product.sku).toBe("FAR-9");
    expect(product.offers).toBeUndefined();
    expect(product.brand).toBeUndefined();
    expect(product.manufacturer).toBeUndefined();
  });

  it("uses the visible product subtitle in Product JSON-LD", async () => {
    const { schema } = await getRenderedProductSchema();

    expect(schema["@graph"][0].description).toBe("محصول با مشخصات قابل بررسی");
  });

  it("omits database-only descriptions when the visible product subtitle duplicates the title", async () => {
    getProductBySlugMock.mockResolvedValue({ ...validProduct, Name: "مدل ناشناخته" });

    const { schema } = await getRenderedProductSchema();

    expect(schema["@graph"][0].description).toBeUndefined();
  });

  it("uses the verified thumbnail for Product JSON-LD when the 2110 banner is missing", async () => {
    getProductBySlugMock.mockResolvedValue({
      ...validProduct,
      img1: "blackmagic-2110-ip-converter-3x3g/blackmagic-2110-ip-converter-3x3g-mini.png",
      img2: "blackmagic-2110-ip-converter-3x3g/blackmagic-2110-ip-converter-3x3g-banner.jpg",
    });

    const { schema } = await getRenderedProductSchema();

    expect(schema["@graph"][0].image).toBe(
      "https://farabaks3.storage.c2.liara.space/productImages/blackmagic-2110-ip-converter-3x3g/blackmagic-2110-ip-converter-3x3g-mini.png"
    );
  });

  it("escapes markup characters in database text before embedding JSON-LD", async () => {
    getProductBySlugMock.mockResolvedValue({
      ...validProduct,
      Type: "</script><script>alert(1)</script>",
    });

    const { raw } = await getRenderedProductSchema();

    expect(raw).not.toContain("<");
    expect(raw).toContain("\\u003c/script>");
  });
});
