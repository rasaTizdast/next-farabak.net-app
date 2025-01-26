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
  // Explicitly define the type of the `pages` array as (number | string)[]
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

  // Construct dynamic path based on slugs
  const path = `${basePath}${categorySlug ? `/${categorySlug}` : ""}${
    subcategorySlug ? `/${subcategorySlug}` : ""
  }/page`;
  return (
    <div className="flex flex-wrap justify-center items-center mt-16 gap-2">
      {/* First Button */}
      <Link href={`${path}/1`} passHref>
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
      <Link href={`${path}/${currentPage - 1}`} passHref>
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
          <Link key={index} href={`${path}/${page}`}>
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
      <Link href={`${path}/${currentPage + 1}`} passHref>
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
      <Link href={`${path}/${totalPages}`} passHref>
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
