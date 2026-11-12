import { BreadcrumbSkeleton, ProductListingSkeleton } from "../_components/ProductListSkeletons";

export default function ProductSearchLoading() {
  return (
    <div dir="rtl">
      <BreadcrumbSkeleton />
      <ProductListingSkeleton title="نتایج جستجو" />
    </div>
  );
}
