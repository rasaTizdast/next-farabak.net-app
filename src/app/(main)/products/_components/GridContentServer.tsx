import Image from "next/image";
import Link from "next/link";

import Pagination from "@/app/_components/ui/Pagination";
import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";

import { fetchProducts } from "../_utils/fetchProducts";

interface Product {
  ProductId: number;
  Type: string;
  img1: string;
  productSlug: string;
  Slug?: string;
  link: string;
  Available: boolean;
  Price: string;
  Discount: string;
}

interface GridContentServerProps {
  apiUrl: string;
  currentPage: number;
  categorySlug?: string;
  subcategorySlug?: string;
}

export const GridContentServer: React.FC<GridContentServerProps> = async ({
  apiUrl,
  currentPage,
  categorySlug,
  subcategorySlug,
}) => {
  const { data: products, pagination } = await fetchProducts(apiUrl);
  const totalPages = pagination.totalPages;

  // Get the USD to Rial rate once for all products
  const usdRate = await fetchUsdToRialRate();
  const isValidRate = usdRate && !isNaN(usdRate) && usdRate > 0;

  // Filter the products to only include those that are available
  const availableProducts = products.filter((product: Product) => product.Available);

  // Helper function to calculate discount percentage
  const getDiscountPercentage = (price: string, discount: string): number => {
    if (!discount || +discount === 0) return 0;
    return Math.round((+discount / +price) * 100);
  };

  return (
    <>
      {/* Product Grid */}
      <div className="grid w-full grid-cols-1 items-stretch justify-items-center gap-4 min-[485px]:grid-cols-2 min-[485px]:gap-4 sm:grid-cols-2 sm:gap-6 md:grid-cols-[repeat(auto-fill,minmax(180px,1fr))] lg:grid-cols-[repeat(auto-fill,minmax(220px,1fr))] xl:grid-cols-[repeat(auto-fill,minmax(240px,1fr))]">
        {availableProducts.map((product: Product) => {
          const hasPrice = product.Price && +product.Price > 0;
          const hasDiscount = product.Discount && +product.Discount > 0;
          const discountPercentage = hasDiscount
            ? getDiscountPercentage(product.Price, product.Discount)
            : 0;
          const finalPrice = hasDiscount
            ? (+product.Price - +product.Discount) * usdRate
            : +product.Price * usdRate;
          const originalPrice = +product.Price * usdRate;

          return (
            <Link
              key={product.ProductId}
              href={`/products/${product.link}`}
              className="group relative flex w-full min-w-[130px] flex-col items-center overflow-hidden rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition-all duration-300 hover:shadow-xl max-[484px]:flex-row max-[484px]:gap-3 sm:min-w-0 sm:p-4 sm:hover:scale-105"
            >
              {/* Product Image Container with Discount Badge */}
              <div className="relative mb-3 w-full max-[484px]:mb-0 max-[484px]:w-[120px] max-[484px]:flex-shrink-0 sm:mb-4">
                {/* Discount Badge */}
                {hasDiscount && discountPercentage > 0 && (
                  <div className="absolute left-2 top-2 z-[1] rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white shadow-md sm:px-3 sm:text-sm">
                    {discountPercentage.toLocaleString("fa-IR")}% تخفیف
                  </div>
                )}
                <Image
                  width={300}
                  height={300}
                  quality={100}
                  src={`${process.env.LIARA_BUCKET_URL}/productImages/${product.img1}`}
                  alt={product.Type}
                  loading="eager"
                  className="aspect-square w-full object-contain drop-shadow-md"
                />
              </div>

              {/* Product Info - Now uses flex-col with flex-1 to push price to bottom */}
              <div className="flex w-full flex-1 flex-col items-start gap-2 text-right">
                {/* Product Name */}
                <h2 className="line-clamp-2 text-base font-medium leading-tight text-gray-800">
                  {product.Type}
                </h2>

                {/* Price Section - mt-auto pushes it to the bottom */}
                <div className="mt-auto w-full">
                  {!hasPrice || !isValidRate ? (
                    <div className="rounded-lg bg-gray-100 px-2 py-2 text-center">
                      <span className="text-xs font-medium text-gray-600 sm:text-sm">
                        {!hasPrice ? "تماس بگیرید" : "برای دریافت قیمت تماس بگیرید"}
                      </span>
                    </div>
                  ) : hasDiscount ? (
                    <div className="flex flex-col gap-1">
                      {/* Original Price */}
                      <span className="text-xs font-light text-gray-400 line-through sm:text-sm">
                        {originalPrice.toLocaleString("fa-IR")} تومان
                      </span>
                      {/* Discounted Price */}
                      <span className="text-s font-bold text-gray-900 sm:text-lg">
                        {finalPrice.toLocaleString("fa-IR")} تومان
                      </span>
                    </div>
                  ) : (
                    <span className="text-base font-bold text-gray-900 sm:text-lg">
                      {finalPrice.toLocaleString("fa-IR")} تومان
                    </span>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        basePath="/products"
        categorySlug={categorySlug}
        subcategorySlug={subcategorySlug}
      />
    </>
  );
};
