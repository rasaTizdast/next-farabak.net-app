// app/products/[category]/[product]/components/Skeletons.tsx
export function SkeletonFeatures() {
  return (
    <div className="space-y-4">
      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
      <div className="h-4 bg-gray-200 rounded animate-pulse w-full"></div>
    </div>
  );
}
