import {
  BreadcrumbSkeleton,
  CategoryPageSkeleton,
} from "../_components/ProductListSkeletons";

export default function CategoryLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="در حال بارگذاری">
      <BreadcrumbSkeleton />
      <CategoryPageSkeleton />
    </div>
  );
}