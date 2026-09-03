export default function NewInvoiceLoading() {
  return (
    <div
      className="mx-auto max-w-[1200px] animate-pulse rounded-lg bg-white px-4 py-8 shadow-[0_4px_12px_rgba(0,0,0,0.1)] md:px-8"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="mx-auto mb-8 h-7 w-48 rounded-md bg-gray-200" />

      <table className="mb-8 w-full table-fixed border-collapse">
        <thead>
          <tr>
            {["نام محصول", "قیمت واحد", "تعداد", "مجموع", "تخفیف", "قیمت نهایی", "عملیات"].map(
              (col) => (
                <th key={col} className="border border-gray-200 bg-gray-100 p-4 text-start">
                  <div className="h-3 w-14 rounded bg-gray-200" />
                </th>
              )
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 4 }).map((_, i) => (
            <tr key={i}>
              {Array.from({ length: 7 }).map((_, j) => (
                <td key={j} className="border border-gray-200 p-4">
                  <div className="h-4 w-full rounded bg-gray-100" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mb-4 h-6 w-48 rounded bg-gray-200" />
      <div className="h-12 w-full rounded-[6px] bg-gray-200" />
    </div>
  );
}
