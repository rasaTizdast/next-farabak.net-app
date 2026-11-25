"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useModalA11y } from "@/hooks/useModalA11y";
import type { AdminCommentItem, AdminCommentPage } from "@/lib/comments/admin-queries";

type Decision = "APPROVED" | "REJECTED";
type Selection = { comment: AdminCommentItem; decision: Decision };

const statusLabels = { PENDING: "در انتظار بررسی", APPROVED: "منتشر شده", REJECTED: "رد شده" };
const presentationLabels = {
  MEMBER: "عضو",
  ALIAS: "نام مستعار مدیر",
  EDITORIAL: "پاسخ تیم",
  LEGACY: "دیدگاه پیشین",
};

function DecisionDialog({
  selection,
  note,
  setNote,
  error,
  saving,
  onCancel,
  onConfirm,
}: {
  selection: Selection;
  note: string;
  setNote: (value: string) => void;
  error: string;
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const panelRef = useModalA11y<HTMLDivElement>({
    onClose: onCancel,
    shouldCloseOnEscape: () => !saving,
  });
  return (
    <div className="fixed inset-0 z-100 grid place-items-center bg-black/70 p-4">
      <div
        ref={panelRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="decision-title"
        className="w-full max-w-md rounded-lg border border-slate-700 bg-slate-900 p-5 text-slate-100 shadow-lg"
      >
        <h2 id="decision-title" className="text-lg font-bold">
          {selection.decision === "APPROVED" ? "تأیید انتشار دیدگاه؟" : "ثبت تصمیم برای دیدگاه؟"}
        </h2>
        <label className="mt-4 grid gap-2">
          یادداشت داخلی {selection.comment.status === "APPROVED" && "(الزامی)"}
          <textarea
            className="rounded border border-slate-600 bg-slate-800 p-2"
            maxLength={1000}
            value={note}
            onChange={(event) => setNote(event.target.value)}
          />
        </label>
        {error && (
          <p className="mt-2 text-red-300" role="alert">
            {error}
          </p>
        )}
        <div className="mt-4 flex gap-2">
          <button
            className="rounded bg-blue-700 px-3 py-2 text-white"
            type="button"
            disabled={saving}
            onClick={onConfirm}
          >
            {selection.decision === "APPROVED" ? "تأیید انتشار" : "ثبت تصمیم"}
          </button>
          <button type="button" disabled={saving} onClick={onCancel}>
            انصراف
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CommentsManager() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.toString();
  const [page, setPage] = useState<AdminCommentPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [note, setNote] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const [saving, setSaving] = useState(false);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError("");
    fetch(`/api/admin/comments${query ? `?${query}` : ""}`, {
      signal: controller.signal,
      cache: "no-store",
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("request failed");
        return response.json() as Promise<AdminCommentPage>;
      })
      .then((result) => {
        if (!controller.signal.aborted) setPage(result);
      })
      .catch(() => {
        if (!controller.signal.aborted) setError("دریافت دیدگاه‌ها انجام نشد. دوباره تلاش کنید.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query, revision]);

  function navigate(key: string, value: string) {
    const params = new URLSearchParams(query);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== "cursor") params.delete("cursor");
    const suffix = params.toString();
    router.replace(`/admin/comments${suffix ? `?${suffix}` : ""}`);
  }

  function choose(comment: AdminCommentItem, decision: Decision) {
    setSelection({ comment, decision });
    setNote("");
    setDecisionError("");
  }

  async function submitDecision() {
    if (!selection || saving) return;
    if (selection.comment.status === "APPROVED" && !note.trim()) {
      setDecisionError("برای پنهان کردن دیدگاه یادداشت داخلی را وارد کنید.");
      return;
    }
    setSaving(true);
    setDecisionError("");
    try {
      const response = await fetch(`/api/admin/comments/${selection.comment.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          decision: selection.decision,
          ...(note.trim() ? { note: note.trim() } : {}),
        }),
      });
      if (!response.ok) throw new Error("request failed");
      setSelection(null);
      setRevision((current) => current + 1);
    } catch {
      setDecisionError("ثبت تصمیم انجام نشد. وضعیت دیدگاه را دوباره بررسی کنید.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div dir="rtl" className="mx-auto max-w-7xl">
      <h1 className="text-2xl font-bold text-slate-100">مدیریت دیدگاه‌ها</h1>
      <p className="mt-2 text-sm text-slate-400">
        دیدگاه‌ها پس از تأیید در سایت نمایش داده می‌شوند.
      </p>
      <div className="mt-6 flex flex-wrap gap-4 rounded-lg bg-slate-800 p-4 shadow-sm">
        <label className="grid gap-1 text-sm">
          وضعیت
          <select
            className="rounded border border-slate-600 bg-slate-900 p-2"
            value={searchParams.get("status") ?? ""}
            onChange={(event) => navigate("status", event.target.value)}
          >
            <option value="">همه وضعیت‌ها</option>
            <option value="PENDING">در انتظار بررسی</option>
            <option value="APPROVED">منتشر شده</option>
            <option value="REJECTED">رد شده</option>
          </select>
        </label>
        <label className="grid gap-1 text-sm">
          نوع صفحه
          <select
            className="rounded border border-slate-600 bg-slate-900 p-2"
            value={searchParams.get("targetType") ?? ""}
            onChange={(event) => navigate("targetType", event.target.value)}
          >
            <option value="">همه صفحه‌ها</option>
            <option value="blog">مقاله</option>
            <option value="product">محصول</option>
          </select>
        </label>
      </div>
      {loading && (
        <p className="mt-6" role="status">
          در حال دریافت دیدگاه‌ها...{" "}
        </p>
      )}
      {!loading && error && (
        <div className="mt-6">
          <p role="alert">{error}</p>
          <button type="button" onClick={() => setRevision((value) => value + 1)}>
            تلاش دوباره
          </button>
        </div>
      )}
      {!loading && !error && page?.comments.length === 0 && (
        <p className="mt-6">دیدگاهی پیدا نشد.</p>
      )}
      {!loading && !error && page && page.comments.length > 0 && (
        <ul className="mt-6 grid gap-4">
          {page.comments.map((comment) => (
            <li
              key={comment.id}
              className="min-w-0 rounded-lg border border-slate-700 bg-slate-800 p-4 shadow-sm"
            >
              <div className="flex flex-wrap justify-between gap-2 text-sm text-slate-400">
                <span>
                  {statusLabels[comment.status]} · {presentationLabels[comment.author.presentation]}
                </span>
                <time dateTime={comment.createdAt}>
                  {new Date(comment.createdAt).toLocaleDateString("fa-IR")}
                </time>
              </div>
              <p className="mt-3 font-bold">
                {comment.author.displayName}{" "}
                <span className="text-sm font-normal text-slate-400">
                  (شناسه حساب: {comment.author.actorId ?? "نامشخص"})
                </span>
              </p>
              <p className="mt-2 wrap-break-word whitespace-pre-wrap">{comment.body}</p>
              {comment.parent && (
                <p className="mt-3 rounded bg-slate-900 p-3 text-sm">
                  در پاسخ به {comment.parent.displayName}: {comment.parent.body}
                </p>
              )}
              <p className="mt-3 text-sm">
                صفحه:{" "}
                {comment.target.href ? (
                  <Link href={comment.target.href}>{comment.target.label}</Link>
                ) : (
                  comment.target.label
                )}
              </p>
              {comment.reviewedAt && (
                <p className="mt-2 text-sm text-slate-400">
                  بررسی توسط {comment.reviewerId ?? "نامشخص"} در{" "}
                  <time dateTime={comment.reviewedAt}>
                    {new Date(comment.reviewedAt).toLocaleDateString("fa-IR")}
                  </time>
                  {comment.reviewNote && ` · ${comment.reviewNote}`}
                </p>
              )}
              <div className="mt-4 flex flex-wrap gap-2">
                {comment.status === "PENDING" && (
                  <>
                    <button
                      className="rounded bg-blue-700 px-3 py-2 text-white"
                      type="button"
                      onClick={() => choose(comment, "APPROVED")}
                    >
                      تأیید
                    </button>
                    <button
                      className="rounded border border-red-400 px-3 py-2 text-red-300"
                      type="button"
                      onClick={() => choose(comment, "REJECTED")}
                    >
                      رد
                    </button>
                  </>
                )}
                {comment.status === "APPROVED" && (
                  <button
                    className="rounded border border-red-400 px-3 py-2 text-red-300"
                    type="button"
                    onClick={() => choose(comment, "REJECTED")}
                  >
                    پنهان کردن
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      {!loading && !error && page && (
        <div className="mt-5 flex gap-3">
          {searchParams.has("cursor") && (
            <button type="button" onClick={() => navigate("cursor", "")}>
              صفحه اول
            </button>
          )}
          {page.nextCursor && (
            <button type="button" onClick={() => navigate("cursor", String(page.nextCursor))}>
              صفحه بعد
            </button>
          )}
        </div>
      )}
      {selection && (
        <DecisionDialog
          selection={selection}
          note={note}
          setNote={setNote}
          error={decisionError}
          saving={saving}
          onCancel={() => setSelection(null)}
          onConfirm={submitDecision}
        />
      )}
    </div>
  );
}
