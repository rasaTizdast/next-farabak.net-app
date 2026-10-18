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
    <div className="flex w-full max-w-[calc(1900px-20rem)] flex-col items-center rounded-lg bg-[#141414] p-12 shadow-[0_4px_10px_rgba(0,0,0,0.1)] max-[576px]:p-8 max-[400px]:px-6">
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
      {img && (
        <SmartImage
          src={`${process.env.LIARA_BUCKET_URL}/overview-details-images${img}`}
          alt={title || "Product image"}
          width={1920}
          height={1080}
          quality={75}
          loading="lazy"
          className="h-auto w-[80%] max-w-[900px] min-w-[550px] rounded-lg shadow-[0_4px_10px_5px_rgba(255,255,255,0.1)] max-[768px]:min-w-[300px] max-[400px]:min-w-[200px]"
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
      <p className="flex w-full max-w-[calc(1900px-20rem)] flex-col items-center rounded-lg bg-[#141414] p-12 text-center text-white shadow-[0_4px_10px_rgba(0,0,0,0.1)] max-[576px]:p-8 max-[400px]:px-6">
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
