import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getProductBySlugMock } = vi.hoisted(() => ({
  getProductBySlugMock: vi.fn(),
}));

vi.mock("@/lib/data/products", () => ({ getProductBySlug: getProductBySlugMock }));
vi.mock("./components/ProductDataWrapper", () => ({ default: () => null }));
vi.mock("./components/ui/Skeletons", () => ({ ProductMainSkeleton: () => null }));

import { generateMetadata } from "./page";

const product = {
  Available: true,
  QrCode_key: null,
  QrCode_expiryDays: null,
  SEO_Title: "Argus 2 | فرابک",
  SEO_Description: "مشخصات دوربین Argus 2",
  Type: "Argus 2",
  Name: "دوربین Argus 2",
  img2: "reolink/argus-2.png",
  categorySlug: "reolink-cctv-camera",
  subCategorySlug: "night-vision",
  productSlug: "Argus-2",
};

describe("product page metadata", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://farabak.net");
    vi.stubEnv("LIARA_BUCKET_URL", "https://farabaks3.storage.c2.liara.space/");
    getProductBySlugMock.mockResolvedValue(product);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("uses the stored primary product slug in its canonical URL", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({
        category: "reolink-cctv-camera",
        subcategory: "wifi",
        product: "argus-2",
      }),
      searchParams: Promise.resolve({ key: "" }),
    });

    expect(metadata.alternates?.canonical).toBe(
      "https://farabak.net/products/reolink-cctv-camera/night-vision/Argus-2"
    );
  });

  it("uses the absolute product bucket URL for Open Graph and Twitter images", async () => {
    const metadata = await generateMetadata({
      params: Promise.resolve({
        category: "reolink-cctv-camera",
        subcategory: "night-vision",
        product: "Argus-2",
      }),
      searchParams: Promise.resolve({ key: "" }),
    });
    const imageUrl = "https://farabaks3.storage.c2.liara.space/productImages/reolink/argus-2.png";

    expect(metadata.openGraph?.images).toEqual([imageUrl]);
    expect(metadata.twitter?.images).toEqual([imageUrl]);
  });

  it("uses the working site image when a product image is missing", async () => {
    getProductBySlugMock.mockResolvedValue({ ...product, img2: null });

    const metadata = await generateMetadata({
      params: Promise.resolve({
        category: "reolink-cctv-camera",
        subcategory: "night-vision",
        product: "Argus-2",
      }),
      searchParams: Promise.resolve({ key: "" }),
    });

    expect(metadata.openGraph?.images).toEqual(["https://farabak.net/Farabak_Logo.webp"]);
    expect(metadata.twitter?.images).toEqual(["https://farabak.net/Farabak_Logo.webp"]);
  });
});
