import type { Metadata } from "next";
import { Suspense } from "react";

import SwaggerClient from "./SwaggerClient";
import LoadingSpinner from "../_components/ui/LoadingSpinner";

export const metadata: Metadata = {
  title: "مستندات API | فراباک",
  description: "مستندات کامل API فروشگاه فراباک",
};

export default function SwaggerPage() {
  return (
    <Suspense
      fallback={
        <div className="mt-12">
          <LoadingSpinner />
        </div>
      }
    >
      <SwaggerClient />
    </Suspense>
  );
}
