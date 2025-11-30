import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  categorySlug?: string;
  subcategorySlug?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  basePath,
  categorySlug,
  subcategorySlug,
}) => {
  // Get page numbers for desktop view
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push("...");
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  // Get simplified page numbers for mobile view
  const getMobilePageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    // Show current page and one page on each side
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      if (currentPage > 1) {
        pages.push(1);
      }

      // Show ellipsis if there's a gap
      if (currentPage > 2) {
        pages.push("...");
      }

      // Show current page
      if (currentPage !== 1 && currentPage !== totalPages) {
        pages.push(currentPage);
      }

      // Show ellipsis if there's a gap
      if (currentPage < totalPages - 1) {
        pages.push("...");
      }

      // Always show last page
      if (currentPage < totalPages) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  // Construct dynamic path based on slugs
  const path = `${basePath}${categorySlug ? `/${categorySlug}` : ""}${
    subcategorySlug ? `/${subcategorySlug}` : ""
  }/page`;

  return (
    <div className="mt-8 sm:mt-16">
      {/* Mobile Pagination - Simplified */}
      <div className="flex items-center justify-between gap-2 sm:hidden">
        {/* Previous Button */}
        <Link href={currentPage === 1 ? "#" : `${path}/${currentPage - 1}`}>
          <button
            className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ${
              currentPage === 1
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
            }`}
            disabled={currentPage === 1}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            قبلی
          </button>
        </Link>

        {/* Page Indicator */}
        <div className="flex items-center gap-2">
          {getMobilePageNumbers().map((page, index) =>
            typeof page === "number" ? (
              <Link key={index} href={`${path}/${page}`}>
                <button
                  className={`min-w-[36px] rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ${
                    page === currentPage
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300 active:bg-gray-400"
                  }`}
                >
                  {page}
                </button>
              </Link>
            ) : (
              <span key={index} className="px-1 text-gray-400">
                ...
              </span>
            )
          )}
        </div>

        {/* Next Button */}
        <Link href={currentPage === totalPages ? "#" : `${path}/${currentPage + 1}`}>
          <button
            className={`flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-medium transition duration-200 ${
              currentPage === totalPages
                ? "cursor-not-allowed bg-gray-200 text-gray-400"
                : "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700"
            }`}
            disabled={currentPage === totalPages}
          >
            بعدی
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
        </Link>
      </div>

      {/* Desktop Pagination - Full */}
      <div className="hidden flex-wrap items-center justify-center gap-2 sm:flex">
        {/* First Button */}
        <Link href={`${path}/1`}>
          <button
            className={`rounded-lg px-3 py-2 text-base font-medium transition duration-200 ${
              currentPage === 1
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={currentPage === 1}
          >
            اولین
          </button>
        </Link>

        {/* Previous Button */}
        <Link href={`${path}/${currentPage - 1}`}>
          <button
            className={`rounded-lg px-3 py-2 text-base font-medium transition duration-200 ${
              currentPage === 1
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={currentPage === 1}
            rel="prev"
          >
            قبلی
          </button>
        </Link>

        {/* Page Numbers */}
        {getPageNumbers().map((page, index) =>
          typeof page === "number" ? (
            <Link key={index} href={`${path}/${page}`}>
              <button
                className={`min-w-[40px] rounded-lg px-3 py-2 text-base font-medium transition duration-200 ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {page}
              </button>
            </Link>
          ) : (
            <span key={index} className="px-3 py-2 text-base text-gray-500">
              ...
            </span>
          )
        )}

        {/* Next Button */}
        <Link href={`${path}/${currentPage + 1}`}>
          <button
            className={`rounded-lg px-3 py-2 text-base font-medium transition duration-200 ${
              currentPage === totalPages
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={currentPage === totalPages}
            rel="next"
          >
            بعدی
          </button>
        </Link>

        {/* Last Button */}
        <Link href={`${path}/${totalPages}`}>
          <button
            className={`rounded-lg px-3 py-2 text-base font-medium transition duration-200 ${
              currentPage === totalPages
                ? "cursor-not-allowed bg-gray-300 text-gray-500"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
            disabled={currentPage === totalPages}
          >
            آخرین
          </button>
        </Link>
      </div>
    </div>
  );
};

export default Pagination;
