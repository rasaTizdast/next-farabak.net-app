import Link from "next/link";
import { notFound } from "next/navigation";

import Pagination from "@/app/_components/ui/Pagination";
import {
  getAllProducts,
  getProductsByCategory,
  getProductsBySubcategory,
  searchProducts,
} from "@/lib/data/products";
import { getUsdToRialRate } from "@/lib/data/usd2rial";

import ProductCard, { type ProductCardData } from "./ProductCard";
import ProductResultsBar from "./ProductResultsBar";

interface ProductFeed {
  data: ProductCardData[];
  pagination: {
    totalCount: number;
    currentPage: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

interface GridContentServerProps {
  apiUrl: string;
  currentPage: number;
  categorySlug?: string;
  subcategorySlug?: string;
  showSearch?: boolean;
}

async function loadProductFeed(apiUrl: string): Promise<ProductFeed> {
  let feed: ProductFeed | null = null;

  try {
    const url = new URL(apiUrl);
    const page = Number(url.searchParams.get("page") || "1");
    const limit = Number(url.searchParams.get("limit") || "30");
    const pathname = url.pathname;

    if (pathname.includes("/getAllProducts")) {
      feed = (await getAllProducts({ page, limit })) as ProductFeed | null;
    } else if (pathname.includes("/getProductsByCategory/")) {
      const slug = pathname.split("/getProductsByCategory/")[1] || "";
      feed = (await getProductsByCategory(slug, { page, limit })) as ProductFeed | null;
    } else if (pathname.includes("/getProductsBySubcategory/")) {
      const slug = pathname.split("/getProductsBySubcategory/")[1] || "";
      feed = (await getProductsBySubcategory(slug, { page, limit })) as ProductFeed | null;
    } else if (pathname.includes("/api/products/search")) {
      feed = (await searchProducts(url.searchParams.get("q") || "", {
        page,
        limit,
      })) as ProductFeed;
    } else {
      throw new Error(`Unsupported product feed URL: ${apiUrl}`);
    }
  } catch (error) {
    console.error(error);
    notFound();
  }

  if (feed === null) {
    notFound();
  }

  return feed;
}

export const GridContentServer: React.FC<GridContentServerProps> = async ({
  apiUrl,
  currentPage,
  categorySlug,
  subcategorySlug,
  showSearch = true,
}) => {
  const [feed, usdRateData] = await Promise.all([loadProductFeed(apiUrl), getUsdToRialRate()]);
  const { data: products, pagination } = feed;
  if (currentPage < 1 || pagination.currentPage !== currentPage) {
    notFound();
  }
  const totalPages = pagination.totalPages;

  // Get the USD to Rial rate once for all products
  const { rate } = usdRateData;
  const usdRate = rate ?? 0;
  const isValidRate = usdRate && !isNaN(usdRate) && usdRate > 0;

  // Filter the products to only include those that are available
  const availableProducts = products.filter((product) => product.Available);

  return (
    <>
      <ProductResultsBar
        resultCount={availableProducts.length}
        totalCount={pagination.totalCount}
        currentPage={currentPage}
        showSearch={showSearch}
      />

      {availableProducts.length > 0 ? (
        <div className="grid w-full grid-cols-1 items-stretch gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {availableProducts.map((product) => (
            <ProductCard
              key={product.ProductId}
              product={product}
              usdRate={usdRate}
              isValidRate={Boolean(isValidRate)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-(--farabak-ink-deep)/20 bg-(--farabak-paper) px-5 py-14 text-center">
          <p className="text-lg font-bold text-(--farabak-ink-deep)">محصولی برای نمایش پیدا نشد</p>
          <p className="mt-2 text-sm leading-7 text-(--farabak-ink-muted)">
            عبارت جستجو یا دسته‌بندی دیگری را امتحان کنید، یا برای انتخاب مناسب با ما تماس بگیرید.
          </p>
          <Link
            href="/contact-us"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-md bg-(--farabak-action-blue) px-4 py-2 text-sm font-semibold text-white focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            ارتباط با کارشناسان
          </Link>
        </div>
      )}

      {/* Pagination Controls */}
      {availableProducts.length > 0 ? (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          basePath="/products"
          categorySlug={categorySlug}
          subcategorySlug={subcategorySlug}
        />
      ) : null}
    </>
  );
};
