export default function EditUserLoading() {
  return (
    <form
      className="flex animate-pulse flex-col items-center justify-center gap-6 self-center rounded-lg bg-white p-6 md:p-6"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="flex w-full flex-wrap justify-evenly gap-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex w-full flex-col gap-2">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="h-[50px] w-full rounded-lg border border-gray-200 bg-gray-100" />
          </div>
        ))}
      </div>
      <div className="mt-4 h-10 w-32 rounded-[6px] bg-gray-200" />
    </form>
  );
}
