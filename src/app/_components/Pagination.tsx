// src/app/(main)/products/_components/Pagination.tsx
import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
  categorySlug?: string; // optional category slug for product category pages
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  basePath,
  categorySlug,
}) => {
  const getPageNumbers = () => {
    const pages = [];

    // Display all pages if total is small
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show the first page
      pages.push(1);

      // Show "..." if currentPage is far from the start
      if (currentPage > 3) {
        pages.push("...");
      }

      // Calculate start and end points for page numbers
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      // Show "..." if currentPage is far from the end
      if (currentPage < totalPages - 2) {
        pages.push("...");
      }

      // Always show the last page
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="flex flex-wrap justify-center items-center mt-16 gap-2">
      {/* First Button */}
      <Link href={`${basePath}?page=1`} passHref>
        <button
          className={`px-2 py-1 sm:px-3 sm:py-2 rounded transition duration-200 text-xs sm:text-base 
            ${
              currentPage === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          disabled={currentPage === 1}
        >
          اولین
        </button>
      </Link>

      {/* Previous Button */}
      <Link
        href={`${basePath}${categorySlug ? `/${categorySlug}` : ""}?page=${
          currentPage + 1
        }`}
        passHref
      >
        <button
          className={`px-2 py-1 sm:px-3 sm:py-2 rounded transition duration-200 text-xs sm:text-base 
            ${
              currentPage === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
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
          <Link key={index} href={`${basePath}?page=${page}`}>
            <button
              className={`px-2 py-1 sm:px-3 sm:py-2 rounded transition duration-200 text-xs sm:text-base
                ${
                  page === currentPage
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
            >
              {page}
            </button>
          </Link>
        ) : (
          <span
            key={index}
            className="px-2 py-1 sm:px-3 sm:py-2 text-gray-500 text-xs sm:text-base"
          >
            ...
          </span>
        )
      )}

      {/* Next Button */}
      <Link
        href={`${basePath}${categorySlug ? `/${categorySlug}` : ""}?page=${
          currentPage + 1
        }`}
        passHref
      >
        <button
          className={`px-2 py-1 sm:px-3 sm:py-2 rounded transition duration-200 text-xs sm:text-base 
            ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          disabled={currentPage === totalPages}
          rel="next"
        >
          بعدی
        </button>
      </Link>

      {/* Last Button */}
      <Link href={`${basePath}?page=${totalPages}`} passHref>
        <button
          className={`px-2 py-1 sm:px-3 sm:py-2 rounded transition duration-200 text-xs sm:text-base 
            ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          disabled={currentPage === totalPages}
        >
          آخرین
        </button>
      </Link>
    </div>
  );
};

export default Pagination;
