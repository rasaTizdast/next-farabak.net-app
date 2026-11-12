import Link from "next/link";

import SmartImage from "@/components/ui/SmartImage";

export interface ProductCardData {
  ProductId: number;
  Name?: string | null;
  Type?: string | null;
  Price?: string | null;
  Discount?: string | null;
  Available?: boolean | null;
  img1?: string | null;
  link: string;
}

interface ProductCardProps {
  product: ProductCardData;
  usdRate: number | null;
  isValidRate: boolean;
}

function getDiscountPercentage(price: string, discount: string): number {
  if (!discount || Number(discount) === 0 || Number(price) === 0) return 0;
  return Math.round((Number(discount) / Number(price)) * 100);
}

function getProductImageSrc(image: string | null | undefined): string {
  if (!image) return "/Farabak_Logo.webp";
  if (image.startsWith("http") || image.startsWith("/")) return image;

  const bucketUrl = process.env.LIARA_BUCKET_URL || process.env.NEXT_PUBLIC_LIARA_BUCKET_URL;
  return bucketUrl ? `${bucketUrl}/productImages/${image}` : "/Farabak_Logo.webp";
}

function ProductCard({ product, usdRate, isValidRate }: ProductCardProps) {
  const title = product.Type?.trim() || product.Name?.trim() || "محصول فرابک";
  const hasPrice = Boolean(product.Price && Number(product.Price) > 0);
  const hasDiscount = Boolean(product.Discount && Number(product.Discount) > 0);
  const discountPercentage = hasDiscount
    ? getDiscountPercentage(product.Price ?? "0", product.Discount ?? "0")
    : 0;
  const originalPrice = Number(product.Price ?? 0) * (usdRate ?? 0);
  const finalPrice = (Number(product.Price ?? 0) - Number(product.Discount ?? 0)) * (usdRate ?? 0);
  const href = `/products/${product.link.replace(/^\/+/, "")}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-(--farabak-ink-deep)/10 bg-white shadow-[0_10px_30px_rgba(6,26,48,0.06)] transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-(--farabak-action-blue)/35 hover:shadow-[0_18px_45px_rgba(6,26,48,0.12)]">
      <Link
        href={href}
        className="flex h-full flex-col rounded-[inherit] focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:ring-offset-2 focus-visible:outline-none"
        aria-label={`مشاهده ${title}`}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-(--farabak-paper) p-4 sm:p-6">
          {hasDiscount && discountPercentage > 0 ? (
            <span className="absolute top-3 left-3 z-1 rounded-full bg-(--farabak-action-blue) px-2.5 py-1 text-xs font-bold text-white">
              {discountPercentage.toLocaleString("fa-IR")}٪ تخفیف
            </span>
          ) : null}
          <SmartImage
            fill
            src={getProductImageSrc(product.img1)}
            alt={`تصویر ${title}`}
            sizes="(min-width: 1536px) 240px, (min-width: 1280px) 300px, (min-width: 1024px) 29vw, (min-width: 640px) 44vw, 92vw"
            quality={75}
            className="size-full object-contain transition-transform duration-500 group-hover:scale-105"
          />
        </div>

        <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3 text-xs text-(--farabak-ink-muted)">
            <span className="rounded-full bg-(--farabak-paper) px-2.5 py-1">تجهیزات فرابک</span>
            <span dir="ltr" className="shrink-0 font-mono">
              <bdi>FAR-{product.ProductId}</bdi>
            </span>
          </div>
          <h2 className="line-clamp-2 text-base leading-8 font-bold text-(--farabak-ink-deep) sm:text-lg">
            {title}
          </h2>

          <div className="mt-auto border-t border-(--farabak-ink-deep)/10 pt-3">
            {!hasPrice ? (
              <p className="text-sm font-semibold text-(--farabak-action-blue)">
                برای قیمت تماس بگیرید
              </p>
            ) : !isValidRate ? (
              <p className="text-sm font-semibold text-(--farabak-action-blue)">
                برای دریافت قیمت تماس بگیرید
              </p>
            ) : hasDiscount ? (
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                <span className="text-xs text-(--farabak-ink-muted) line-through">
                  {Math.floor(originalPrice).toLocaleString("fa-IR")} تومان
                </span>
                <span className="text-lg font-extrabold text-(--farabak-ink-deep)">
                  {Math.floor(finalPrice).toLocaleString("fa-IR")} تومان
                </span>
              </div>
            ) : (
              <span className="text-lg font-extrabold text-(--farabak-ink-deep)">
                {Math.floor(originalPrice).toLocaleString("fa-IR")} تومان
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

export default ProductCard;
