type Props = {
  amount?: number;
};

const CategorySliderLoader = ({ amount = 6 }: Props) => {
  return (
    <div className="flex items-center gap-2 pb-10 md:gap-4">
      {/* Right Button Skeleton */}
      <div className="order-1 hidden h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-gray-200 mobile:flex"></div>

      {/* Slider Container */}
      <div
        className="scrollbar-hide order-2 flex gap-3 overflow-x-auto scroll-smooth md:gap-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          direction: "rtl",
        }}
      >
        {Array.from({ length: amount }).map((_, index) => (
          <div
            key={index}
            className="relative h-[55px] w-[280px] flex-shrink-0 animate-pulse overflow-hidden rounded-2xl bg-gray-300 shadow-lg"
          />
        ))}
      </div>

      {/* Left Button Skeleton */}
      <div className="order-3 hidden h-10 w-10 flex-shrink-0 animate-pulse rounded-full bg-gray-200 mobile:flex"></div>

      {/* Hide scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default CategorySliderLoader;
