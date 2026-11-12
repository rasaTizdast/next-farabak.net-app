import { Skeleton } from "@/components/ui/skeleton";

type Props = {
  amount?: number;
};

const CategorySliderLoader = ({ amount = 6 }: Props) => {
  return (
    <div className="flex items-center gap-2 pb-10 md:gap-4">
      {/* Right Button Skeleton */}
      <Skeleton className="mobile:flex order-1 hidden size-10 shrink-0 rounded-full" />

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
            className="relative h-[55px] w-[280px] shrink-0 overflow-hidden rounded-2xl shadow-sm"
          >
            <Skeleton className="size-full rounded-2xl" />
          </div>
        ))}
      </div>

      {/* Left Button Skeleton */}
      <Skeleton className="mobile:flex order-3 hidden size-10 shrink-0 rounded-full" />

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
