const models = [
  {
    name: "CTX 5800",
    productUrl: "/products/x-ray/airport-luggage/ctx-5800",
    manufacturerUrl: "https://www.smithsdetection.com/products/ctx-5800/",
    throughput: "۴۰۰ تا ۴۵۰ بسته در ساعت؛ سرعت نوار ۰٫۱۴ متر بر ثانیه",
    tunnelWidth: "۷۵۰ میلی‌متر",
    itemLength: "با افزونه‌های پرده‌ای، طول نامحدود اعلام شده است",
    dimensions: "۱۵۷۰ × ۱۵۵۰ × ۲۶۱۰ میلی‌متر",
  },
  {
    name: "CTX 9800 DSi",
    productUrl: "/products/x-ray/airport-luggage/ctx-9800-dsi",
    manufacturerUrl: "https://www.smithsdetection.com/products/ctx-9800-dsi/",
    throughput: "تا ۱٬۸۰۰ بسته در ساعت؛ سرعت نوار ۰٫۳ تا ۰٫۵ متر بر ثانیه",
    tunnelWidth: "۱۰۲۰ میلی‌متر",
    itemLength: "بسته‌های تا ۲٫۵ متر",
    dimensions: "۲۴۰۰ × ۲۱۷۷ × ۴۸۰۳ میلی‌متر",
  },
] as const;

const comparisonRows = [
  { label: "ظرفیت و سرعت نوار", key: "throughput" },
  { label: "عرض دهانه تونل", key: "tunnelWidth" },
  { label: "طول بسته", key: "itemLength" },
  { label: "ابعاد کلی دستگاه", key: "dimensions" },
] as const;

export default function XRayModelComparison() {
  return (
    <section
      aria-labelledby="xray-model-comparison-title"
      className="mx-auto mt-12 w-full max-w-[1580px] px-6 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40"
      dir="rtl"
    >
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
        <h2
          id="xray-model-comparison-title"
          className="text-xl leading-tight font-bold text-(--farabak-ink-deep) md:text-2xl"
        >
          مقایسه دو مدل ایکس‌ری CTX برای بار فرودگاهی
        </h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-(--farabak-ink-muted) md:text-base">
          اگر بین این دو مدل انتخاب می‌کنید، ظرفیت موردنیاز خط، اندازه بزرگ‌ترین بسته و فضای نصب را
          کنار هم بررسی کنید. ارقام زیر مشخصات اعلام‌شده سازنده‌اند؛ ظرفیت واقعی به پیکربندی و شرایط
          خط بستگی دارد.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-right text-sm leading-7">
            <caption className="sr-only">مقایسه مشخصات اعلام‌شده CTX 5800 و CTX 9800 DSi</caption>
            <thead>
              <tr className="border-b border-slate-300 text-(--farabak-ink-deep)">
                <th className="p-3 font-semibold" scope="col">
                  معیار انتخاب
                </th>
                {models.map((model) => (
                  <th className="p-3 font-semibold" key={model.name} scope="col">
                    <a
                      className="underline decoration-slate-300 underline-offset-4"
                      href={model.productUrl}
                    >
                      <bdi dir="ltr">{model.name}</bdi>
                    </a>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonRows.map((row) => (
                <tr className="border-b border-slate-200 last:border-0" key={row.key}>
                  <th className="p-3 align-top font-medium text-slate-700" scope="row">
                    {row.label}
                  </th>
                  {models.map((model) => (
                    <td className="p-3 align-top text-slate-800" key={model.name}>
                      {model[row.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 text-sm leading-7 text-(--farabak-ink-muted)">
          منابع مشخصات:{" "}
          {models.map((model, index) => (
            <span key={model.name}>
              {index > 0 ? " و " : null}
              <a
                className="font-semibold text-(--farabak-action-blue) underline underline-offset-4"
                href={model.manufacturerUrl}
                rel="noopener noreferrer"
                target="_blank"
              >
                <bdi dir="ltr">Smiths Detection {model.name}</bdi>
              </a>
            </span>
          ))}
          . برای انتخاب نهایی، نقشه خط، اقلام قابل بازرسی، اتصال به سامانه جابه‌جایی بار و نیازهای
          بهره‌برداری پروژه را با کارشناس بررسی کنید.
        </p>
      </div>
    </section>
  );
}
