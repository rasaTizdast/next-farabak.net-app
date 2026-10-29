import { ActionLink } from "@/components/public/ActionLink";

interface ProductResultsBarProps {
  resultCount: number;
  totalCount: number;
  currentPage: number;
}

function toPersianNumber(value: number) {
  return value.toLocaleString("fa-IR");
}

export default function ProductResultsBar({
  resultCount,
  totalCount,
  currentPage,
}: ProductResultsBarProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-(--farabak-ink-deep)/10 bg-(--farabak-paper) p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
      <div
        className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-(--farabak-ink-muted)"
        aria-live="polite"
      >
        <strong className="text-(--farabak-ink-deep)">
          {toPersianNumber(resultCount)} نتیجه در این صفحه
        </strong>
        <span>{toPersianNumber(totalCount)} محصول در کاتالوگ</span>
        <span className="text-xs">صفحه {toPersianNumber(currentPage)}</span>
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
        <ActionLink href="/product-finder" className="w-full sm:w-auto">
          راهنمای انتخاب محصول
        </ActionLink>
        <ActionLink href="/products/search" variant="secondary" className="w-full sm:w-auto">
          جستجوی محصول
        </ActionLink>
      </div>
    </div>
  );
}
