export default function AllInvoicesLoading() {
  return (
    <div className="animate-pulse" role="status" aria-label="در حال بارگذاری">
      <div className="mb-6 rounded-md border border-amber-200 bg-amber-100 p-4">
        <div className="h-4 w-3/4 rounded bg-amber-200" />
      </div>
      <div className="h-5 w-48 rounded bg-gray-200" />
      <div className="mt-5 max-h-[620px] overflow-y-auto border border-gray-200">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["شماره فاکتور", "مبلغ کل", "وضعیت", "زمان باقیمانده", "عملیات‌ها"].map((col) => (
                <th
                  key={col}
                  className="sticky top-0 z-10 w-[15%] border-b border-gray-200 bg-gray-100 p-[10px] text-center"
                >
                  <div className="mx-auto h-3 w-16 rounded bg-gray-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }).map((_, i) => (
              <tr key={i}>
                {Array.from({ length: 5 }).map((_, j) => (
                  <td key={j} className="border-b border-gray-200 p-[10px] text-center">
                    <div className="mx-auto h-4 w-2/3 rounded bg-gray-100" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
