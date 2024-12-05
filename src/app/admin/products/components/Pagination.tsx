type Props = {
  pagination: { currentPage: number; totalPages: number };
  setPagination: (updatedPagination: {
    currentPage: number;
    totalPages: number;
  }) => void;
};

const Pagination = ({ pagination, setPagination }: Props) => {
  const { currentPage, totalPages } = pagination;

  const changePage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setPagination({ ...pagination, currentPage: page });
  };

  return (
    <div className="w-full flex justify-center items-center mt-5 gap-2">
      <button
        onClick={() => changePage(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-4 py-2 rounded-lg ${
          currentPage === 1 ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
        } text-white transition-all`}
      >
        قبلی
      </button>
      {[...Array(totalPages)].map((_, index) => (
        <button
          key={index}
          onClick={() => changePage(index + 1)}
          className={`px-3 py-2 rounded-lg ${
            currentPage === index + 1
              ? "bg-blue-700 text-white"
              : "bg-white text-gray-700 hover:bg-gray-200"
          }`}
        >
          {index + 1}
        </button>
      ))}
      <button
        onClick={() => changePage(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-4 py-2 rounded-lg ${
          currentPage === totalPages
            ? "bg-gray-400"
            : "bg-blue-600 hover:bg-blue-700"
        } text-white transition-all`}
      >
        بعدی
      </button>
    </div>
  );
};

export default Pagination;
