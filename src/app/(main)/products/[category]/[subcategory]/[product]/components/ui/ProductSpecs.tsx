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
    return null;
  }

  return (
    <div
      data-product-section-content
      className="flex w-full max-w-[calc(1900px-20rem)] flex-col rounded-2xl border border-(--farabak-ink-deep)/10 bg-white p-5 shadow-[0_18px_45px_rgba(6,26,48,0.06)] sm:p-7"
    >
      <h3 className="mb-5 text-start text-xl font-bold text-(--farabak-ink-deep) max-[576px]:mb-4">
        مشخصات محصول
      </h3>
      <div
        role="region"
        aria-label="جدول مشخصات محصول"
        tabIndex={0}
        className="overflow-x-auto rounded-xl border border-(--farabak-ink-deep)/10 focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:outline-none"
      >
        <div className="min-w-136">
          {specsData.map((item: Spec, index: number) => (
            <div
              key={`spec-${item.productSpecsId}-${item.Title}-${item.Description}`}
              className={`${index % 2 ? "bg-slate-50" : "bg-(--farabak-paper)"} grid grid-cols-[minmax(12rem,0.7fr)_minmax(18rem,1fr)] gap-8 px-5 py-4 text-start text-sm sm:text-base`}
            >
              <div className="font-semibold text-(--farabak-ink-deep)">{item.Title}</div>
              <div className="whitespace-pre-wrap text-(--farabak-ink-muted)">
                {item.Description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
