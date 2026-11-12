import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getProductOverviewDetailsMock } = vi.hoisted(() => ({
  getProductOverviewDetailsMock: vi.fn(),
}));

vi.mock("@/lib/data/productOverview", () => ({
  getProductOverviewDetails: getProductOverviewDetailsMock,
}));

import ProductOverviewDetails from "./ProductOverviewDetails";

describe("ProductOverviewDetails image rendering", () => {
  beforeEach(() => {
    vi.stubEnv("LIARA_BUCKET_URL", "https://s3.farabak.net");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it("omits image markup when the stored image path contains only slashes", async () => {
    getProductOverviewDetailsMock.mockResolvedValue([
      {
        ProductOverviewDetailsId: 1,
        Title: "ویژگی محصول",
        Description: "شرح ویژگی",
        Img: "/",
        ProductName: "محصول",
      },
    ]);

    const markup = renderToStaticMarkup(await ProductOverviewDetails({ productId: 323 }));

    expect(markup).not.toContain("overview-details-images");
  });

  it("keeps an overview image when the stored path has a filename", async () => {
    getProductOverviewDetailsMock.mockResolvedValue([
      {
        ProductOverviewDetailsId: 2,
        Title: "نمای محصول",
        Description: "شرح تصویر",
        Img: "/Blackmagic 2110 IP Converter 3x3G - inputs - outputs.png",
        ProductName: "محصول",
      },
    ]);

    const markup = renderToStaticMarkup(await ProductOverviewDetails({ productId: 323 }));

    expect(markup).toContain("overview-details-images");
    expect(markup).toContain("inputs%2520-%2520outputs.png");
  });
});
