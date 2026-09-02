// app/products/[category]/[product]/components/ProductOverview.tsx
import {
  getProductOverviewDetails,
  type ProductOverviewDetailItem,
} from "@/lib/data/productOverview";

import ImageWithFallback from "./ImageWithFallback";

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
    <div className="flex w-full max-w-[calc(1900px-20rem)] flex-col items-center rounded-lg bg-[#141414] p-8 shadow-[0_4px_10px_rgba(0,0,0,0.1)] max-[576px]:px-4 max-[400px]:px-2 max-[400px]:py-[0.8rem]">
      <div className="mb-10 flex flex-col items-center gap-[1.3rem] text-white">
        {title && (
          <h3 className="mb-4 text-center text-[1.7rem] font-black max-[768px]:text-[1.3rem] max-[400px]:mb-2 max-[400px]:text-[1.1rem]">
            {title}
          </h3>
        )}
        {description && (
          <p className="w-[75%] text-justify text-[1rem] font-light max-[768px]:w-[90%] max-[768px]:text-[0.9rem] max-[400px]:mb-0 max-[400px]:text-[0.7rem]">
            {description}
          </p>
        )}
      </div>
      <ImageWithFallback
        src={img ? `${process.env.LIARA_BUCKET_URL}/overview-details-images${img}` : null}
        alt={title || "Product image"}
        width={1920}
        height={1080}
        quality={75}
        loading="lazy"
        className="h-auto w-[80%] max-w-[900px] min-w-[550px] rounded-lg shadow-[0_4px_10px_5px_rgba(255,255,255,0.1)] max-[768px]:min-w-[300px] max-[400px]:min-w-[200px]"
      />
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
      <p className="flex w-full max-w-[calc(1900px-20rem)] flex-col items-center rounded-lg bg-[#141414] p-8 text-center text-white shadow-[0_4px_10px_rgba(0,0,0,0.1)] max-[576px]:px-4 max-[400px]:px-2 max-[400px]:py-[0.8rem]">
        اطلاعاتی یافت نشد / این محصول توضیحات ندارد
      </p>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      {productDetails.map((detail: ProductOverviewDetailItem) => (
        <div
          key={detail.ProductOverviewDetailsId}
          className="flex w-full max-w-[calc(1900px-20rem)] flex-col items-center rounded-lg bg-[#141414] p-8 shadow-[0_4px_10px_rgba(0,0,0,0.1)] max-[576px]:px-4 max-[400px]:px-2 max-[400px]:py-[0.8rem]"
        >
          <Overview title={detail.Title} description={detail.Description} img={detail.Img} />
        </div>
      ))}
    </div>
  );
}
