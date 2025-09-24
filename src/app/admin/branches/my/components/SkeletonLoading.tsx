import { Card, Skeleton } from "antd";

export default function SkeletonLoading() {
  return (
    <div className="p-6">
      {/* Branch details card skeleton */}
      <Card
        title={<Skeleton.Input active size="small" style={{ width: 150 }} />}
        className="mb-6 overflow-hidden rounded-lg bg-gray-800 text-white shadow-md"
        headStyle={{
          backgroundColor: "#1f2937",
          borderBottom: "1px solid #374151",
          color: "#f3f4f6",
          padding: "12px 16px",
        }}
        bodyStyle={{ backgroundColor: "#1f2937", padding: "16px" }}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded bg-gray-900/30 p-5">
              <Skeleton.Input active size="small" style={{ width: 100 }} />
              <Skeleton.Input active size="large" style={{ width: 150 }} />
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs skeleton */}
      <div className="mb-6 rounded-lg bg-gray-800 pt-4 text-white">
        <div className="mb-4 flex gap-4 px-4">
          {[1, 2].map((i) => (
            <Skeleton.Input key={i} active size="small" style={{ width: 120 }} />
          ))}
        </div>
        <div className="p-4">
          {/* Products table skeleton */}
          <Card
            className="overflow-hidden rounded-lg border-0 bg-gray-800 text-white"
            headStyle={{
              backgroundColor: "#19202b",
              borderBottom: "1px solid #374151",
              color: "#f3f4f6",
              padding: "16px 20px",
            }}
            bodyStyle={{
              backgroundColor: "#19202b",
              padding: "16px 20px",
            }}
          >
            <div className="space-y-4">
              {/* Table header skeleton */}
              <div className="flex items-center justify-between">
                <Skeleton.Input active size="small" style={{ width: 150 }} />
                <Skeleton.Input active size="small" style={{ width: 120 }} />
              </div>
              {/* Table rows skeleton */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b border-gray-700 py-5"
                >
                  <Skeleton.Input active size="small" style={{ width: 200 }} />
                  <Skeleton.Input active size="small" style={{ width: 100 }} />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
