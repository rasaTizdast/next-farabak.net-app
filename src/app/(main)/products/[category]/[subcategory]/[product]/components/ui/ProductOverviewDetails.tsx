// app/products/[category]/[product]/components/ProductOverview.tsx
import SmartImage from "@/components/ui/SmartImage";
import {
  getProductOverviewDetails,
  type ProductOverviewDetailItem,
} from "@/lib/data/productOverview";

function getOverviewImageUrl(image: string | null): string | null {
  let imagePath = image?.trim() ?? "";
  let bucketUrl =
    (process.env.LIARA_BUCKET_URL || process.env.NEXT_PUBLIC_LIARA_BUCKET_URL)?.trim() ?? "";

  while (imagePath.startsWith("/")) imagePath = imagePath.slice(1);
  while (bucketUrl.endsWith("/")) bucketUrl = bucketUrl.slice(0, -1);

  if (!imagePath || !bucketUrl) return null;

  return new URL(imagePath, bucketUrl + "/overview-details-images/").toString();
}

function Overview({
  title,
  description,
  img,
}: {
  title: string | null;
  description: string | null;
  img: string | null;
}) {
  const imageUrl = getOverviewImageUrl(img);

  return (
    <div className="bg-(--farabak-ink-deep) mx-auto flex w-full max-w-[1580px] flex-col items-center rounded-2xl p-6 shadow-[0_18px_45px_rgba(6,26,48,0.12)] sm:p-10">
      <div className="mb-8 flex max-w-3xl flex-col items-center gap-4 text-white">
        {title && <h3 className="mb-2 text-center text-2xl font-bold sm:text-3xl">{title}</h3>}
        {description && (
          <p className="text-center text-sm leading-8 text-slate-200 sm:text-base">{description}</p>
        )}
      </div>
      {imageUrl && (
        <div className="relative aspect-video w-full max-w-[900px] overflow-hidden rounded-xl bg-white/5 shadow-[0_4px_10px_5px_rgba(255,255,255,0.1)]">
          <SmartImage
            src={imageUrl}
            alt={title || "Product image"}
            width={1920}
            height={1080}
            quality={75}
            loading="lazy"
            sizes="(max-width: 768px) 100vw, 900px"
            className="size-full object-contain"
          />
        </div>
      )}
    </div>
  );
}

export default async function ProductOverviewDetails({ productId }: { productId: number }) {
  const productDetails = await getProductOverviewDetails(productId).catch((error: unknown) => {
    console.error(error);
    return [] as ProductOverviewDetailItem[];
  });

  if (productDetails.length === 0) {
    return null;
  }

  return (
    <div
      data-product-section-content
      className="mx-auto flex w-full max-w-[1580px] flex-col items-center gap-8"
    >
      {productDetails.map((detail: ProductOverviewDetailItem) => (
        <Overview
          key={detail.ProductOverviewDetailsId}
          title={detail.Title}
          description={detail.Description}
          img={detail.Img}
        />
      ))}
    </div>
  );
}
