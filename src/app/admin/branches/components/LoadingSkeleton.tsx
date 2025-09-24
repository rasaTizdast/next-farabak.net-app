import React from "react";

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 rounded-lg bg-gray-950 p-4 text-white sm:p-6" dir="rtl">
      {/* Header section */}
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="mb-2 h-8 w-48 animate-pulse rounded-md bg-gray-800"></div>
          <div className="h-4 w-64 animate-pulse rounded-md bg-gray-800"></div>
        </div>
        <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
          <div className="h-10 w-full animate-pulse rounded-md bg-gray-800 sm:w-72"></div>
          <div className="h-10 w-full animate-pulse rounded-md bg-blue-800/60 sm:w-32"></div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-gray-900 shadow-md">
        {/* Table header skeleton */}
        <div className="flex border-b border-gray-700 bg-gray-800 p-4">
          <div className="w-[15%] px-2">
            <div className="h-6 w-full animate-pulse rounded-md bg-gray-700"></div>
          </div>
          <div className="w-[30%] px-2">
            <div className="h-6 w-full animate-pulse rounded-md bg-gray-700"></div>
          </div>
          <div className="w-[20%] px-2">
            <div className="h-6 w-full animate-pulse rounded-md bg-gray-700"></div>
          </div>
          <div className="w-[15%] px-2">
            <div className="h-6 w-full animate-pulse rounded-md bg-gray-700"></div>
          </div>
          <div className="w-[20%] px-2">
            <div className="h-6 w-full animate-pulse rounded-md bg-gray-700"></div>
          </div>
        </div>

        {/* Table rows skeleton */}
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center border-b border-gray-700 p-4">
            <div className="w-[15%] px-2">
              <div className="h-5 w-4/5 animate-pulse rounded-md bg-gray-700"></div>
            </div>
            <div className="w-[30%] px-2">
              <div className="h-5 w-4/5 animate-pulse rounded-md bg-gray-700"></div>
            </div>
            <div className="w-[20%] px-2">
              <div className="h-5 w-4/5 animate-pulse rounded-md bg-gray-700"></div>
            </div>
            <div className="w-[15%] px-2">
              {/* Product status badge skeleton */}
              <div className="animate-pulse rounded-lg border border-blue-700/50 bg-blue-900/30 px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="h-4 w-16 rounded-sm bg-blue-700/60"></div>
                  <div className="h-4 w-14 rounded-md bg-blue-800/70"></div>
                </div>
              </div>
            </div>
            <div className="w-[20%] px-2">
              <div className="flex space-x-2 rtl:space-x-reverse">
                {/* Edit button */}
                <div className="h-8 w-20 animate-pulse rounded-md bg-blue-600/70"></div>
                {/* Products button */}
                <div className="h-8 w-24 animate-pulse rounded-md bg-gray-700/70"></div>
                {/* Delete button */}
                <div className="h-8 w-16 animate-pulse rounded-md bg-red-500/70"></div>
              </div>
            </div>
          </div>
        ))}

        {/* Pagination skeleton */}
        <div className="flex justify-end border-t border-gray-700 bg-gray-800 p-4">
          <div className="flex space-x-1 rtl:space-x-reverse">
            {[1, 2, 3].map((item) => (
              <div key={item} className="mx-1 h-8 w-8 animate-pulse rounded-md bg-gray-700"></div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes skeletonPulse {
          0% {
            opacity: 0.6;
          }
          50% {
            opacity: 0.8;
          }
          100% {
            opacity: 0.6;
          }
        }

        .animate-pulse {
          animation: skeletonPulse 1.5s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LoadingSkeleton;
