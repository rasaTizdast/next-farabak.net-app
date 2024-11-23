const BlogSkeleton = () => {
  return (
    <div className="w-full animate-pulse space-y-8">
      {/* Latest Blog Skeleton */}
      <div className="mt-5 h-8 w-56 bg-gray-200 rounded"></div>
      <div className="h-96 bg-gray-200 rounded-lg"></div>

      {/* Categories Skeleton */}
      <div className="space-y-4">
        <div className="mt-5 h-8 w-56 bg-gray-200 rounded"></div>
        <div className="flex gap-5">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="h-10 w-32 bg-gray-200 rounded-lg"></div>
            ))}
        </div>
      </div>

      {/* Other Blogs Skeleton */}
      <div className="space-y-4">
        <div className="mt-5 h-8 w-56 bg-gray-200 rounded"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="border border-gray-200 rounded-lg shadow-lg p-5 space-y-4"
              >
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <div className="h-6 w-3/4 bg-gray-200 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default BlogSkeleton;
