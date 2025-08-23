import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";

// helpers/formatPrice.ts
export const formatPrice = async (price: number) => {
  if (!price) return "بدون قیمت";
  const usdRate = await fetchUsdToRialRate();

  // Check if usdRate is valid
  if (!usdRate || isNaN(usdRate) || usdRate <= 0) {
    return "برای دریافت قیمت تماس بگیرید";
  }

  const updatedPrice = price * usdRate;
  return updatedPrice.toLocaleString("fa-IR") + " تومان";
};
