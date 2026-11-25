"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";

import { useUser } from "@/context/UserContext";
import type { CommentTarget } from "@/lib/comments/types";

export default function CommentForm({
  target,
  parentId,
}: {
  target: CommentTarget;
  parentId?: number;
}) {
  const { user, isAdmin, loading } = useUser();
  const helpId = useId();
  const [body, setBody] = useState("");
  const [alias, setAlias] = useState("");
  const [useAlias, setUseAlias] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  if (loading) return <p>در حال بررسی حساب کاربری...</p>;
  if (!user)
    return parentId ? null : (
      <p>
        برای ثبت دیدگاه{" "}
        <Link className="text-blue-700 underline" href="/auth/login">
          ورود به حساب کاربری
        </Link>
        .
      </p>
    );
  if (parentId && !isAdmin) return null;
  const missingName = !user.firstName?.trim() || !user.lastName?.trim();
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setMessage("");
    try {
      const payload = parentId
        ? { target, body, mode: "editorial", parentId }
        : useAlias
          ? { target, body, mode: "alias", alias }
          : { target, body, mode: "member" };
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("submit failed");
      setBody("");
      setAlias("");
      setMessage("دیدگاه شما ثبت شد و پس از بررسی نمایش داده می‌شود.");
    } catch {
      setMessage("ارسال دیدگاه انجام نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl bg-slate-50 p-4">
      {isAdmin && !parentId && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useAlias}
            onChange={(e) => setUseAlias(e.target.checked)}
          />{" "}
          ثبت با نام مستعار
        </label>
      )}
      {useAlias && !parentId && (
        <label className="block">
          نام مستعار
          <input
            className="mt-1 block w-full rounded border border-slate-300 p-2"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            minLength={2}
            maxLength={80}
            required
          />
        </label>
      )}
      {!parentId && !useAlias && missingName && (
        <p>
          برای ثبت دیدگاه، نام و نام خانوادگی خود را در{" "}
          <Link className="text-blue-700 underline" href="/dashboard/edit-user">
            پروفایل
          </Link>{" "}
          تکمیل کنید.
        </p>
      )}
      {!parentId && !useAlias && !missingName && (
        <p>
          نام نمایشی: {user.firstName} {user.lastName}
        </p>
      )}
      <label className="block">
        {parentId ? "متن پاسخ" : "متن دیدگاه"}
        <textarea
          className="mt-1 block w-full rounded border border-slate-300 p-2"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          minLength={10}
          maxLength={2000}
          required
          aria-describedby={helpId}
        />
      </label>
      <p id={helpId} className="text-sm text-slate-600">
        ۱۰ تا ۲۰۰۰ نویسه؛ {Array.from(body).length} نویسه
      </p>
      <button
        type="submit"
        disabled={submitting || (!parentId && !useAlias && missingName)}
        className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-60"
      >
        {parentId ? "ارسال پاسخ" : "ارسال دیدگاه"}
      </button>
      <p role="status" aria-live="polite">
        {message}
      </p>
    </form>
  );
}
