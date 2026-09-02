// app/products/[category]/[product]/components/ProductSpecs.tsx
import { getProductSpecsByProductId } from "@/lib/data/productSpecs";

interface Spec {
  productSpecsId: number;
  Title: string;
  Description: string;
}

async function getProductSpecs(productId: number) {
  try {
    const { data } = await getProductSpecsByProductId(productId);
    return data as unknown as Spec[];
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
    <div className="flex w-full max-w-[calc(1900px-20rem)] flex-col rounded-lg bg-white p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)] max-[576px]:px-2 max-[576px]:py-4">
      <h3 className="mb-8 text-center text-[1.3rem] font-extrabold max-[576px]:mb-4">
        مشخصات محصول
      </h3>
      <div className="overflow-x-hidden rounded-lg">
        {specsData.map((item: Spec, index: number) => (
          <div
            key={`spec-${item.productSpecsId}-${item.Title}-${item.Description}`}
            className={`${index % 2 ? "bg-[#efefef]" : "bg-[#e2e2e2]"} flex w-full justify-between gap-10 px-[1.2rem] py-4 text-start max-[576px]:px-4 max-[576px]:py-[0.9rem]`}
          >
            <div className="font-medium max-[576px]:text-[0.9rem]">{item.Title}</div>
            <div className="w-full max-w-[450px] text-start font-light max-[576px]:text-[0.8rem]">
              {item.Description}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
