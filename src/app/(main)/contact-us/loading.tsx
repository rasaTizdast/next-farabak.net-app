export default function ContactUsLoading() {
  return (
    <main
      className="my-4 flex w-full flex-col flex-wrap items-stretch gap-8 px-6 py-8 min-[992px]:px-16 min-[1200px]:px-24 md:my-8 md:flex-row md:px-12 2xl:px-40"
      role="status"
      aria-label="در حال بارگذاری"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex w-full flex-1 flex-col gap-4 rounded-lg bg-white p-8 shadow-[0px_8px_20px_rgba(0,0,0,0.1)] md:flex-[30%_1_1] md:p-[2rem_3rem]"
        >
          <div className="mx-auto h-6 w-1/2 animate-pulse rounded-md bg-gray-200 md:self-start" />
          {Array.from({ length: 4 }).map((_, j) => (
            <div
              key={j}
              className={`h-5 animate-pulse rounded bg-gray-200 ${j === 3 ? "w-2/3" : "w-full"}`}
            />
          ))}
        </div>
      ))}
    </main>
  );
}
