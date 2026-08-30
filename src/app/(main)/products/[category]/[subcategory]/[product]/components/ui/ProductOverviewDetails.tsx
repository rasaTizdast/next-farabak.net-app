// app/products/[category]/[product]/components/ProductOverview.tsx
import axios from "axios";

import ImageWithFallback from "./ImageWithFallback";

interface OverviewDetail {
  ProductOverviewDetailsId: number;
  ProductName: string;
  Title: string | null;
  Description: string | null;
  Img: string | null;
}

async function getProductOverviewDetails(productId: number) {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/productOverviewDetails/getProductOverviewDetails/${productId}`
    );

    if (!res) throw new Error("Failed to fetch overview details");
    return res.data;
  } catch (error) {
    console.error(error);
    return [];
  }
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
  return (
    <div className="bg-[#141414] rounded-lg p-6">
      <div className="flex flex-col items-center gap-4">
        {title && <h3 className="text-[1.7rem] font-bold text-center"> {title}</h3>}
        {description && <p className="text-[1rem] font-light text-center text-justify"> {description}</p>}
      </div>
      <ImageWithFallback
        src={img ? `${process.env.LIARA_BUCKET_URL}/overview-details-images${img}` : null}
        alt={title || "Product image"}
        width={1920}
        height={1080}
        quality={75}
        loading="lazy"
        className="rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1)]"
      />
    </div>
  );
}

export default async function ProductOverviewDetails({ productId }: { productId: number }) {
  const productDetails = await getProductOverviewDetails(productId);

  if (productDetails.length === 0) {
    return <p className="bg-[#141414] rounded-lg p-6 text-white text-center">اطلاعاتی یافت نشد / این محصول توضیحات ندارد</p>;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {productDetails.map((detail: OverviewDetail) => (
        <div key={detail.ProductOverviewDetailsId} className="bg-[#141414] rounded-lg p-6 max-w-2xl">
          <Overview title={detail.Title} description={detail.Description} img={detail.Img} />
        </div>
      ))}
    </div>
  );
}
