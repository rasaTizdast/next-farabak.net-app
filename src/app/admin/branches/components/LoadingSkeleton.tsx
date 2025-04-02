import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="bg-gray-950 rounded-lg text-white p-4 sm:p-6 space-y-6" dir="rtl">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="w-48 h-8 bg-gray-800 rounded-md animate-pulse mb-2"></div>
          <div className="w-64 h-4 bg-gray-800 rounded-md animate-pulse"></div>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-72 h-10 bg-gray-800 rounded-md animate-pulse"></div>
          <div className="w-full sm:w-32 h-10 bg-blue-800/60 rounded-md animate-pulse"></div>
        </div>
      </div>
      
      <div className="bg-gray-900 rounded-lg shadow-md overflow-hidden">
        {/* Table header skeleton */}
        <div className="p-4 flex bg-gray-800 border-b border-gray-700">
          <div className="w-[15%] px-2">
            <div className="w-full h-6 bg-gray-700 rounded-md animate-pulse"></div>
          </div>
          <div className="w-[30%] px-2">
            <div className="w-full h-6 bg-gray-700 rounded-md animate-pulse"></div>
          </div>
          <div className="w-[20%] px-2">
            <div className="w-full h-6 bg-gray-700 rounded-md animate-pulse"></div>
          </div>
          <div className="w-[15%] px-2">
            <div className="w-full h-6 bg-gray-700 rounded-md animate-pulse"></div>
          </div>
          <div className="w-[20%] px-2">
            <div className="w-full h-6 bg-gray-700 rounded-md animate-pulse"></div>
          </div>
        </div>

        {/* Table rows skeleton */}
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="flex items-center border-b border-gray-700 p-4">
            <div className="w-[15%] px-2">
              <div className="w-4/5 h-5 bg-gray-700 rounded-md animate-pulse"></div>
            </div>
            <div className="w-[30%] px-2">
              <div className="w-4/5 h-5 bg-gray-700 rounded-md animate-pulse"></div>
            </div>
            <div className="w-[20%] px-2">
              <div className="w-4/5 h-5 bg-gray-700 rounded-md animate-pulse"></div>
            </div>
            <div className="w-[15%] px-2">
              {/* Product status badge skeleton */}
              <div className="px-3 py-2 rounded-lg border border-blue-700/50 bg-blue-900/30 animate-pulse">
                <div className="flex items-center justify-between gap-2">
                  <div className="w-16 h-4 bg-blue-700/60 rounded-sm"></div>
                  <div className="w-14 h-4 bg-blue-800/70 rounded-md"></div>
                </div>
              </div>
            </div>
            <div className="w-[20%] px-2">
              <div className="flex space-x-2 rtl:space-x-reverse">
                {/* Edit button */}
                <div className="w-20 h-8 bg-blue-600/70 rounded-md animate-pulse"></div>
                {/* Products button */}
                <div className="w-24 h-8 bg-gray-700/70 rounded-md animate-pulse"></div>
                {/* Delete button */}
                <div className="w-16 h-8 bg-red-500/70 rounded-md animate-pulse"></div>
              </div>
            </div>
          </div>
        ))}

        {/* Pagination skeleton */}
        <div className="flex justify-end p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex space-x-1 rtl:space-x-reverse">
            {[1, 2, 3].map((item) => (
              <div key={item} className="w-8 h-8 rounded-md bg-gray-700 animate-pulse mx-1"></div>
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