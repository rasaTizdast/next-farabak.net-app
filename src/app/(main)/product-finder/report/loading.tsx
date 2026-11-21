import { PublicShell } from "@/components/public/PublicShell";

import { FinderStoredStateSkeleton } from "../_components/FinderSkeletons";

export default function ProductFinderReportLoading() {
  return (
    <PublicShell className="py-12">
      <FinderStoredStateSkeleton label="در حال بارگذاری گزارش انتخاب" title="گزارش انتخاب فرابک" />
    </PublicShell>
  );
}
