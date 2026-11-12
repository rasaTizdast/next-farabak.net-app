import { Suspense } from "react";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";

type PublicBreadcrumbsProps = {
  breadcrumbs: string[];
  labels?: Record<string, string>;
};

function BreadcrumbFallback() {
  return (
    <div aria-hidden="true" className="mb-5 h-12 w-full animate-pulse rounded-xl bg-slate-200/80" />
  );
}

export function PublicBreadcrumbs({ breadcrumbs, labels }: PublicBreadcrumbsProps) {
  return (
    <Suspense fallback={<BreadcrumbFallback />}>
      <Breadcrumb breadcrumbs={breadcrumbs} labels={labels} />
    </Suspense>
  );
}
