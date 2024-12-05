// helpers/formatPrice.ts
export const formatPrice = (price: number): string => {
  if (!price) return "بدون قیمت";
  return price.toLocaleString("fa-IR") + " ریال";
};
