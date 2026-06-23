import {
  BreadcrumbSkeleton,
  ProductGridSkeleton,
} from "../../_components/ProductListSkeletons";

export default function SubCategoryLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="در حال بارگذاری">
      <BreadcrumbSkeleton />
      <ProductGridSkeleton />
    </div>
  );
}