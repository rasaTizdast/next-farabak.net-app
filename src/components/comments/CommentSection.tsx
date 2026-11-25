import { Suspense } from "react";

import { listApprovedComments } from "@/lib/comments/queries";
import type { CommentTarget } from "@/lib/comments/types";

import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

export default async function CommentSection({ target }: { target: CommentTarget }) {
  const page = await listApprovedComments(target);
  return (
    <section
      id="comments"
      aria-labelledby="comments-heading"
      className="w-full scroll-mt-32 border-t border-slate-200 py-8"
      data-product-section-content
    >
      <h2 id="comments-heading" className="mb-5 text-xl font-bold text-slate-900">
        دیدگاه‌ها و پرسش‌ها
      </h2>
      <div className="space-y-6">
        <CommentList target={target} initialPage={page} />
        <Suspense fallback={<p>در حال بارگذاری...</p>}>
          <CommentForm target={target} />
        </Suspense>
      </div>
    </section>
  );
}
