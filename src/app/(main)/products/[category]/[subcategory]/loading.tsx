import { BreadcrumbSkeleton, ProductListingSkeleton } from "../../_components/ProductListSkeletons";

export default function SubCategoryLoading() {
  return (
    <div dir="rtl">
      <BreadcrumbSkeleton />
      <ProductListingSkeleton showSearch={false} />
    </div>
  );
}
