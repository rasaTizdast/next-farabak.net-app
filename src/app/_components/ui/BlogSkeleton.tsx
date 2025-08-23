const BlogSkeleton = () => {
  return (
    <div className="w-full animate-pulse space-y-8">
      {/* Latest Blog Skeleton */}
      <div className="mt-5 h-8 w-56 rounded bg-gray-200"></div>
      <div className="h-96 rounded-lg bg-gray-200"></div>

      {/* Categories Skeleton */}
      <div className="space-y-4">
        <div className="mt-5 h-8 w-56 rounded bg-gray-200"></div>
        <div className="flex gap-5">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-10 w-32 rounded-lg bg-gray-200"></div>
            ))}
        </div>
      </div>

      {/* Other Blogs Skeleton */}
      <div className="space-y-4">
        <div className="mt-5 h-8 w-56 rounded bg-gray-200"></div>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="space-y-4 rounded-lg border border-gray-200 p-5 shadow-lg">
                <div className="h-48 rounded-t-lg bg-gray-200"></div>
                <div className="h-6 w-3/4 rounded bg-gray-200"></div>
                <div className="h-4 w-1/2 rounded bg-gray-200"></div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSkeleton;
