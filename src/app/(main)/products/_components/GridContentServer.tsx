import Link from "next/link";
import { notFound } from "next/navigation";

import Pagination from "@/app/_components/ui/Pagination";
import type { PaginationInfo } from "@/lib/data/products";

import ProductCard, { type ProductCardData } from "./ProductCard";
import ProductResultsBar from "./ProductResultsBar";

export interface ProductFeed {
  data: ProductCardData[];
  pagination: PaginationInfo;
}

interface GridContentServerProps {
  feed: ProductFeed;
  currentPage: number;
  categorySlug?: string;
  subcategorySlug?: string;
  showSearch?: boolean;
  usdRate: number | null;
}

export const GridContentServer: React.FC<GridContentServerProps> = ({
  feed,
  currentPage,
  categorySlug,
  subcategorySlug,
  showSearch = true,
  usdRate,
}) => {
  const { data: products, pagination } = feed;
  if (currentPage < 1 || pagination.currentPage !== currentPage) {
    notFound();
  }
  const totalPages = pagination.totalPages;

  const availableProducts = products.filter((product) => product.Available);
  const isValidRate = usdRate !== null && Number.isFinite(usdRate) && usdRate > 0;

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
              isValidRate={isValidRate}
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
