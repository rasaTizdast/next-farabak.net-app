import { Skeleton } from "antd";

export default function SkeletonLoading() {
  return (
    <div className="p-6">
      {/* Branch details skeleton */}
      <div className="mb-6 rounded-lg bg-gray-800 p-4 shadow-md">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded bg-gray-900/30 p-4">
              <Skeleton.Input active size="small" style={{ width: 150 }} />
              <Skeleton.Input active size="large" style={{ width: 200 }} />
            </div>
          ))}
        </div>
      </div>

      {/* Tabs skeleton */}
      <div className="mb-6 rounded-lg bg-gray-800 pt-4 text-white">
        <div className="mb-4 flex gap-4 px-4">
          {[1, 2].map((i) => (
            <Skeleton.Input key={i} active size="small" style={{ width: 120 }} />
          ))}
        </div>
        <div className="p-4">
          {/* Products table skeleton */}
          <div className="space-y-4">
            {/* Table header skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton.Input active size="small" style={{ width: 200 }} />
              <Skeleton.Input active size="small" style={{ width: 120 }} />
            </div>
            {/* Table rows skeleton */}
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between border-b border-gray-700 py-4"
              >
                <Skeleton.Input active size="small" style={{ width: 200 }} />
                <Skeleton.Input active size="small" style={{ width: 100 }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
