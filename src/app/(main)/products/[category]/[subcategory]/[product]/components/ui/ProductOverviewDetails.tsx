// app/products/[category]/[product]/components/ProductOverview.tsx
import SmartImage from "@/components/ui/SmartImage";
import {
  getProductOverviewDetails,
  type ProductOverviewDetailItem,
} from "@/lib/data/productOverview";

function Overview({
  title,
  description,
  img,
}: {
  title: string | null;
  description: string | null;
  img: string | null;
}) {
  return (
    <div className="flex w-full max-w-[calc(1900px-20rem)] flex-col items-center rounded-2xl bg-(--farabak-ink-deep) p-6 shadow-[0_18px_45px_rgba(6,26,48,0.12)] sm:p-10">
      <div className="mb-8 flex max-w-3xl flex-col items-center gap-4 text-white">
        {title && <h3 className="mb-2 text-center text-2xl font-bold sm:text-3xl">{title}</h3>}
        {description && (
          <p className="text-center text-sm leading-8 text-slate-200 sm:text-base">{description}</p>
        )}
      </div>
      {img && (
        <SmartImage
          src={`${process.env.LIARA_BUCKET_URL}/overview-details-images${img}`}
          alt={title || "Product image"}
          width={1920}
          height={1080}
          quality={75}
          loading="lazy"
          className="h-auto w-full max-w-[900px] rounded-xl shadow-[0_4px_10px_5px_rgba(255,255,255,0.1)]"
        />
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
    return (
      <p className="flex w-full max-w-[calc(1900px-20rem)] flex-col items-center rounded-2xl bg-(--farabak-ink-deep) p-8 text-center text-slate-200 shadow-[0_18px_45px_rgba(6,26,48,0.12)]">
        اطلاعاتی یافت نشد / این محصول توضیحات ندارد
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
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
