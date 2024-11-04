type Props = {
  amount: number;
  lgCols?: number;
  xlCols?: number;
};

const SkeletonLoader = ({ amount, lgCols, xlCols }: Props) => {
  return (
    <div
      className={`grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-${
        lgCols || 5
      } xl:grid-cols-${xlCols || 6}`}
    >
      {Array.from({ length: amount }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col items-center animate-pulse p-4 bg-gray-200 rounded-lg shadow-lg"
        >
          <div className="bg-gray-300 h-56 w-full rounded-lg mb-4"></div>
          <div className="h-4 w-3/4 bg-gray-300 rounded mb-2"></div>
          <div className="h-4 w-1/2 bg-gray-300 rounded"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
