import { BreadcrumbSkeleton, CategoryPageSkeleton } from "../_components/ProductListSkeletons";

export default function CategoryLoading() {
  return (
    <div dir="rtl">
      <BreadcrumbSkeleton />
      <CategoryPageSkeleton />
    </div>
  );
}
