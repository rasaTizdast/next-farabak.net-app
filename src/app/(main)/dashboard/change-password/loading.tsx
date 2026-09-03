export default function ChangePasswordLoading() {
  return (
    <div
      className="mt-6 flex w-full max-w-[500px] min-w-[190px] animate-pulse flex-col items-center justify-center gap-6 self-center rounded-lg bg-white p-6 shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:p-6"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="flex w-full flex-col gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="flex w-full flex-col gap-2">
            <div className="h-5 w-32 rounded bg-gray-200" />
            <div className="h-[50px] w-full rounded-lg border border-gray-200 bg-gray-100" />
          </div>
        ))}
      </div>
      <div className="mt-4 h-10 w-32 rounded-[6px] bg-gray-200" />
    </div>
  );
}
