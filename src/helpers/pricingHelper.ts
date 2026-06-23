import { fetchUsdToRialRate } from "./Usd2RialRate";

export interface ProductPricing {
  originalPrice: number | null;
  discountedPrice: number | null;
  currency: string;
  hasDiscount: boolean;
  isValidRate: boolean;
}

export async function calculateProductPricing(
  usdPrice: string | number | null,
  discount: string | number | null
): Promise<ProductPricing> {
  // Handle null/undefined prices
  if (!usdPrice || usdPrice === null || usdPrice === undefined || +usdPrice === 0) {
    return {
      originalPrice: null,
      discountedPrice: null,
      currency: "IRR",
      hasDiscount: false,
      isValidRate: false,
    };
  }

  // Get USD to IRR exchange rate
  const usdRate = await fetchUsdToRialRate();
  const isValidRate = usdRate && !isNaN(usdRate) && usdRate > 0;

  const price = +usdPrice;
  const discountAmount = discount ? +discount : 0;

  if (!isValidRate) {
    return {
      originalPrice: null,
      discountedPrice: null,
      currency: "IRR",
      hasDiscount: false,
      isValidRate: false,
    };
  }

  const originalPrice = Math.round(price * usdRate);
  const hasDiscount = discountAmount > 0;
  const discountedPrice = hasDiscount ? Math.round((price - discountAmount) * usdRate) : null;

  return {
    originalPrice,
    discountedPrice,
    currency: "IRR",
    hasDiscount,
    isValidRate: true,
  };
}

export function formatPriceForSchema(price: number | null): string {
  if (price === null) return "0";
  // Round to avoid floating point issues and ensure it's a valid integer
  return Math.round(price).toString();
}

export function getPriceRangeForSchema(products: any[]): { minPrice: string; maxPrice: string } {
  if (!products || products.length === 0) {
    return { minPrice: "0", maxPrice: "0" };
  }

  const validPrices = products.reduce((acc: number[], product) => {
    if (product.Price && +product.Price > 0) {
      acc.push(+product.Price);
    }
    return acc;
  }, []);

  if (validPrices.length === 0) {
    return { minPrice: "0", maxPrice: "0" };
  }

  const minPrice = Math.min(...validPrices);
  const maxPrice = Math.max(...validPrices);

  return {
    minPrice: minPrice.toString(),
    maxPrice: maxPrice.toString(),
  };
}
