import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";

// helpers/formatPrice.ts
export const formatPrice = async (price: number) => {
  if (!price) return "بدون قیمت";
  const usdRate = await fetchUsdToRialRate();
  const updatedPrice = price * usdRate;
  return updatedPrice.toLocaleString("fa-IR") + " تومان";
};
