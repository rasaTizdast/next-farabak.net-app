// app/products/[category]/[product]/components/ProductSpecs.tsx
import axios from "axios";

interface Spec {
  productSpecsId: number;
  Title: string;
  Description: string;
}

async function getProductSpecs(productId: number) {
  try {
    const res = await axios.get(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/products/getProductSpecsByProductId?productId=${productId}`
    );

    if (!res) throw new Error("Failed to fetch specs");
    return res.data.data;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export default async function ProductSpecs({ productId }: { productId: number }) {
  const specsData = await getProductSpecs(productId);

  if (!specsData || specsData.length === 0) {
    return (
      <div className="mt-6 flex w-full justify-center rounded-lg bg-gray-200 py-4 text-sm font-semibold text-slate-800 sm:mt-0 md:text-base">
        مشخصاتی برای این محصول ثبت نشده است
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <h3 className="mb-4 text-center font-bold text-lg">مشخصات محصول</h3>
      <div className="space-y-2">
        {specsData.map((item: Spec, index: number) => (
          <div
            key={`spec-${item.productSpecsId}-${item.Title}-${item.Description}`}
            className="flex justify-between items-center py-2 px-4 rounded border"
            style={{ borderColor: index % 2 === 0 ? "#efefef" : "#e2e2e2" }}
          >
            <div className="font-medium text">{item.Title}</div>
            <div className="flex-1 text-start text-sm">{item.Description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
