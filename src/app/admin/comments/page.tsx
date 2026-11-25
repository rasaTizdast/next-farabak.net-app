import { Suspense } from "react";

import CommentsManager from "./CommentsManager";

export default function CommentsPage() {
  return (
    <Suspense fallback={<p>در حال دریافت دیدگاه‌ها...</p>}>
      <CommentsManager />
    </Suspense>
  );
}
