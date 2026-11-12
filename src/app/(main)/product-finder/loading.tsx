import { PublicShell } from "@/components/public/PublicShell";

import { FinderIntentSkeleton } from "./_components/FinderSkeletons";

export default function ProductFinderLoading() {
  return (
    <PublicShell className="py-12 sm:py-18">
      <FinderIntentSkeleton />
    </PublicShell>
  );
}
