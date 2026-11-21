import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { ProductBySlugData } from "@/lib/data/products";

import { GET } from "./route";

const {
  getAllProducts,
  getCategoryName,
  getProductBySlug,
  getProductsByCategory,
  getProductsBySubcategory,
  getProductSpecsByProductId,
  getSubCategoryName,
  resolveProductDetailPage,
  findEligibleProducts,
} = vi.hoisted(() => ({
  getAllProducts: vi.fn(),
  getCategoryName: vi.fn(),
  getProductBySlug: vi.fn(),
  getProductsByCategory: vi.fn(),
  getProductsBySubcategory: vi.fn(),
  getProductSpecsByProductId: vi.fn(),
  getSubCategoryName: vi.fn(),
  resolveProductDetailPage: vi.fn(),
  findEligibleProducts: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { product: { findMany: findEligibleProducts } },
}));

vi.mock("@/lib/data/products", () => ({
  getAllProducts,
  getCategoryName,
  getProductBySlug,
  getProductsByCategory,
  getProductsBySubcategory,
  getSubCategoryName,
}));
vi.mock("@/lib/data/productSpecs", () => ({ getProductSpecsByProductId }));
vi.mock("@/lib/data/product-page-validation", () => ({ resolveProductDetailPage }));

const CATEGORY_SLUG = "reolink-cctv-camera";
const PRODUCT_PATH = `/products/${CATEGORY_SLUG}/bullet/B400`;
const CANONICAL_PRODUCT_URL = `https://farabak.net${PRODUCT_PATH}`;

const b400: ProductBySlugData = {
  ProductId: 400,
  Name: "دوربین مداربسته بالت B400",
  Type: "B400",
  Price: null,
  Discount: null,
  CategoryContentId: "1,2",
  img1: null,
  img2: null,
  Available: true,
  Description: "دوربین بالت تحت شبکه با کیفیت ۴ مگاپیکسل",
  CategoryId: 1,
  productSlug: "B400",
  categorySlug: CATEGORY_SLUG,
  subCategorySlug: "bullet",
  SEO_Title: null,
  SEO_Description: null,
  QrCode_key: null,
  QrCode_expiryDays: null,
  productBlog: null,
  Minimum_Amount: null,
  Maximum_Amount: null,
};

const listing = {
  data: [
    { ...b400, QrCode_Key: null },
    { ...b400, Type: "QR-only model", productSlug: "private", QrCode_Key: "keep-private" },
    { ...b400, Type: "Unavailable model", productSlug: "unavailable", Available: false },
  ],
  seoDetails: {
    SEO_Title: "دوربین مداربسته ریولینک",
    SEO_Description: "دوربین‌های تحت شبکه ریولینک",
    SEO_Keywords: null,
  },
  pagination: {
    totalCount: 61,
    currentPage: 2,
    totalPages: 3,
    hasNextPage: true,
    hasPrevPage: true,
  },
};

beforeEach(() => {
  vi.resetAllMocks();
  getAllProducts.mockResolvedValue(listing);
  findEligibleProducts.mockResolvedValue([{ ProductId: 400 }]);
  getCategoryName.mockResolvedValue({ categoryName: "دوربین مداربسته ریولینک" });
  getProductBySlug.mockResolvedValue(b400);
  getProductsByCategory.mockImplementation(async (category: string, { page }: { page: number }) =>
    category === CATEGORY_SLUG && page <= 3 ? listing : null
  );
  getProductsBySubcategory.mockImplementation(
    async (subcategory: string, { page }: { page: number }, category: string) =>
      category === CATEGORY_SLUG && subcategory === "bullet" && page <= 3 ? listing : null
  );
  getProductSpecsByProductId.mockResolvedValue({
    data: [
      {
        ProductSpecsId: 1,
        Name: null,
        ProductId: 400,
        Title: "رزولوشن",
        Description: "2560 × 1440",
      },
    ],
  });
  getSubCategoryName.mockResolvedValue({ subCategoryName: "دوربین بالت" });
  resolveProductDetailPage.mockResolvedValue({
    canonicalPath: PRODUCT_PATH,
    shouldRedirect: false,
  });
});

function makeRequest(url: string) {
  return new NextRequest(new Request(url));
}

function makeContext(slug: string[]) {
  return { params: Promise.resolve({ slug }) };
}

describe("GET /markdown", () => {
  it("serves the homepage markdown with the correct content type and Vary header", async () => {
    const res = await GET(makeRequest("https://farabak.net/markdown"), makeContext([]));

    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    expect(res.headers.get("Vary")).toContain("Accept");
    const body = await res.text();
    expect(body.startsWith("# ")).toBe(true);
  });

  it("serves markdown for known subpages", async () => {
    for (const slug of [["products"], ["about-us"], ["contact-us"], ["privacy"], ["support"]]) {
      const res = await GET(
        makeRequest(`https://farabak.net/markdown/${slug[0]}`),
        makeContext(slug)
      );
      expect(res.status).toBe(200);
      expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    }
  });

  it("returns 404 with a markdown recovery body for unknown paths", async () => {
    const res = await GET(
      makeRequest("https://farabak.net/markdown/does-not-exist"),
      makeContext(["does-not-exist"])
    );

    expect(res.status).toBe(404);
    expect(res.headers.get("Content-Type")).toBe("text/markdown; charset=utf-8");
    const body = await res.text();
    expect(body).toContain("/sitemap.xml");
    expect(body).toContain("/llms.txt");
  });

  it("identifies the canonical page without excluding successful negotiated Markdown", async () => {
    const res = await GET(
      makeRequest("https://farabak.net/markdown/about-us"),
      makeContext(["about-us"])
    );

    expect(res.headers.get("Link")).toBe('<https://farabak.net/about-us>; rel="canonical"');
    expect(res.headers.get("X-Robots-Tag")).toBeNull();
  });

  it.each([
    [`products/${CATEGORY_SLUG}`, "دوربین مداربسته ریولینک"],
    [`products/${CATEGORY_SLUG}/bullet`, "دوربین بالت"],
    [`products/${CATEGORY_SLUG}/page/2`, "دوربین مداربسته ریولینک"],
    [`products/${CATEGORY_SLUG}/bullet/page/2`, "دوربین بالت"],
    ["products/page/2", "تمامی محصولات"],
  ])("renders the public listing at /%s", async (path, title) => {
    const res = await GET(
      makeRequest(`https://farabak.net/markdown/${path}`),
      makeContext(path.split("/"))
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Link")).toBe(`<https://farabak.net/${path}>; rel="canonical"`);
    const body = await res.text();
    expect(body).toContain(`# ${title}`);
    expect(body).toContain(PRODUCT_PATH);
    expect(body).not.toMatch(/keep-private|QR-only model|Unavailable model/);
  });

  it("omits a product that became QR-only after the listing was cached", async () => {
    findEligibleProducts.mockResolvedValue([]);
    const res = await GET(
      makeRequest(`https://farabak.net/markdown/products/${CATEGORY_SLUG}`),
      makeContext(["products", CATEGORY_SLUG])
    );
    expect(res.status).toBe(200);
    expect(await res.text()).not.toContain(PRODUCT_PATH);
    expect(findEligibleProducts).toHaveBeenCalledWith(
      expect.objectContaining({
        select: { ProductId: true },
        where: expect.objectContaining({ Available: true }),
      })
    );
  });

  it("renders a verified model, brand, description, specifications, and catalog links", async () => {
    const res = await GET(
      makeRequest(`https://farabak.net/markdown${PRODUCT_PATH}`),
      makeContext(PRODUCT_PATH.slice(1).split("/"))
    );

    expect(res.status).toBe(200);
    expect(res.headers.get("Link")).toBe(`<${CANONICAL_PRODUCT_URL}>; rel="canonical"`);
    const body = await res.text();
    expect(body).toContain("# B400");
    expect(body).toContain("Reolink");
    expect(body).toContain(b400.Name);
    expect(body).toContain(b400.Description);
    expect(body).toContain("رزولوشن");
    expect(body).toContain("2560 × 1440");
    expect(body).toContain(CANONICAL_PRODUCT_URL);
    expect(body).toContain(`(/products/${CATEGORY_SLUG}/bullet)`);
  });

  it.each([
    "products/wrong-category/bullet",
    `products/${CATEGORY_SLUG}/page/0`,
    `products/${CATEGORY_SLUG}/page/999`,
    `products/${CATEGORY_SLUG}/bullet/page/2/extra`,
    `products/${CATEGORY_SLUG}/bullet%2Fpage/2`,
  ])("rejects malformed, wrong-category, or out-of-range listing /%s", async (path) => {
    const slug = path.split("/").map(decodeURIComponent);
    const res = await GET(makeRequest(`https://farabak.net/markdown/${path}`), makeContext(slug));

    expect(res.status).toBe(404);
    expect(res.headers.get("Link")).toBeNull();
  });

  it("does not serve a QR-only model from the direct endpoint even with its key", async () => {
    resolveProductDetailPage.mockImplementation(async ({ key }) =>
      key === "keep-private" ? { canonicalPath: PRODUCT_PATH, shouldRedirect: false } : null
    );
    getProductBySlug.mockResolvedValue({ ...b400, QrCode_key: "keep-private" });
    const res = await GET(
      makeRequest(`https://farabak.net/markdown${PRODUCT_PATH}?key=keep-private`),
      makeContext(PRODUCT_PATH.slice(1).split("/"))
    );

    expect(res.status).toBe(404);
    expect(res.headers.get("Link")).toBeNull();
    expect(await res.text()).not.toContain("keep-private");
    expect(getProductBySlug).not.toHaveBeenCalled();
  });

  it("excludes unavailable detail records even with a stale successful path resolution", async () => {
    getProductBySlug.mockResolvedValue({ ...b400, Available: false });
    const res = await GET(
      makeRequest(`https://farabak.net/markdown${PRODUCT_PATH}`),
      makeContext(PRODUCT_PATH.slice(1).split("/"))
    );

    expect(res.status).toBe(404);
    expect(res.headers.get("Link")).toBeNull();
  });
});
