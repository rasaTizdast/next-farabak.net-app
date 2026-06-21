import {
  BreadcrumbSkeleton,
  CategorySliderSkeleton,
  ProductGridSkeleton,
} from "./_components/ProductListSkeletons";

export default function ProductsLoading() {
  return (
    <div className="space-y-6" role="status" aria-label="در حال بارگذاری">
      <BreadcrumbSkeleton />
      <CategorySliderSkeleton />
      <ProductGridSkeleton />
    </div>
  );
}