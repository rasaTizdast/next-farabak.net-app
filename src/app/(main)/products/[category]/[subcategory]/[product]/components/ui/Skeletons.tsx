// app/products/[category]/[product]/components/Skeletons.tsx
export function SkeletonFeatures() {
  return (
    <div className="space-y-4">
      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
      <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
    </div>
  );
}
