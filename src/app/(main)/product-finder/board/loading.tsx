import { PublicShell } from "@/components/public/PublicShell";

import { FinderStoredStateSkeleton } from "../_components/FinderSkeletons";

export default function ProductFinderBoardLoading() {
  return (
    <PublicShell className="py-12">
      <FinderStoredStateSkeleton label="در حال بارگذاری میز تصمیم" title="میز تصمیم محصولات" />
    </PublicShell>
  );
}
