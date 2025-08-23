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
          className="flex animate-pulse flex-col items-center rounded-lg bg-gray-200 p-4 shadow-lg"
        >
          <div className="mb-4 h-56 w-full rounded-lg bg-gray-300"></div>
          <div className="mb-2 h-4 w-3/4 rounded bg-gray-300"></div>
          <div className="h-4 w-1/2 rounded bg-gray-300"></div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonLoader;
