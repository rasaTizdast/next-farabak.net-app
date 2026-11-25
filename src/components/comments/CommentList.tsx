"use client";

import { useState } from "react";

import { useUser } from "@/context/UserContext";
import type { CommentTarget, PublicCommentPage, PublicCommentReply } from "@/lib/comments/types";

import CommentForm from "./CommentForm";

function Entry({ comment }: { comment: PublicCommentReply }) {
  return (
    <div>
      <div className="flex flex-wrap gap-3 text-sm text-slate-600">
        <strong>{comment.displayName}</strong>
        {comment.presentation === "EDITORIAL" && <span>پاسخ تیم فرابک</span>}
        {comment.publishedAt && (
          <time dateTime={comment.publishedAt}>
            {new Date(comment.publishedAt).toLocaleDateString("fa-IR")}
          </time>
        )}
      </div>
      <p className="mt-2 whitespace-pre-wrap">{comment.body}</p>
    </div>
  );
}
export default function CommentList({
  target,
  initialPage,
}: {
  target: CommentTarget;
  initialPage: PublicCommentPage;
}) {
  const { isAdmin } = useUser();
  const [comments, setComments] = useState(initialPage.comments);
  const [cursor, setCursor] = useState(initialPage.nextCursor);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function more() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/comments/${target.type}/${target.id}?cursor=${cursor}`);
      if (!response.ok) throw new Error("fetch failed");
      const page = (await response.json()) as PublicCommentPage;
      setComments((current) => [...current, ...page.comments]);
      setCursor(page.nextCursor);
    } catch {
      setError("دریافت دیدگاه‌های بیشتر انجام نشد. دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <>
      <ul className="space-y-4">
        {comments.map((comment) => (
          <li key={comment.id} className="rounded-xl border border-slate-200 p-4">
            <Entry comment={comment} />
            {comment.replies.length > 0 && (
              <ul className="mt-4 space-y-3 border-s-2 border-blue-200 ps-4">
                {comment.replies.map((reply) => (
                  <li key={reply.id}>
                    <Entry comment={reply} />
                  </li>
                ))}
              </ul>
            )}
            {isAdmin && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm text-blue-700">پاسخ تیم فرابک</summary>
                <CommentForm target={target} parentId={comment.id} />
              </details>
            )}
          </li>
        ))}
      </ul>
      {comments.length === 0 && <p>هنوز دیدگاهی ثبت نشده است.</p>}
      {cursor !== null && (
        <button
          type="button"
          onClick={more}
          disabled={loading}
          className="mt-4 text-blue-700 underline"
        >
          دیدگاه‌های بیشتر
        </button>
      )}
      <p role="status">{error}</p>
    </>
  );
}
