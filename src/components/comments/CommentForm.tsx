"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";

import { useUser } from "@/context/UserContext";
import type { CommentTarget } from "@/lib/comments/types";

type FieldErrors = { body?: string; alias?: string };

function limitCodePoints(value: string, maximum: number) {
  return Array.from(value).slice(0, maximum).join("");
}

function readFieldErrors(payload: unknown): FieldErrors {
  if (!payload || typeof payload !== "object" || !("error" in payload)) return {};
  const error = payload.error;
  if (!error || typeof error !== "object" || !("fields" in error)) return {};
  const fields = error.fields;
  if (!fields || typeof fields !== "object") return {};

  return {
    body: "body" in fields && typeof fields.body === "string" ? fields.body : undefined,
    alias: "alias" in fields && typeof fields.alias === "string" ? fields.alias : undefined,
  };
}

export default function CommentForm({
  target,
  parentId,
}: {
  target: CommentTarget;
  parentId?: number;
}) {
  const { user, isAdmin, loading } = useUser();
  const helpId = useId();
  const bodyErrorId = `${helpId}-error`;
  const aliasHelpId = `${helpId}-alias-help`;
  const aliasErrorId = `${helpId}-alias-error`;
  const aliasInputRef = useRef<HTMLInputElement>(null);
  const bodyInputRef = useRef<HTMLTextAreaElement>(null);
  const [body, setBody] = useState("");
  const [alias, setAlias] = useState("");
  const [useAlias, setUseAlias] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
    setMessage("");
    const nextErrors: FieldErrors = {};
    const bodyLength = Array.from(body.trim()).length;
    if (bodyLength < 10) nextErrors.body = "متن دیدگاه باید دست‌کم ۱۰ نویسه داشته باشد.";
    if (bodyLength > 2000) nextErrors.body = "متن دیدگاه نمی‌تواند بیشتر از ۲۰۰۰ نویسه باشد.";
    const aliasLength = Array.from(alias.trim()).length;
    if (useAlias && aliasLength < 2)
      nextErrors.alias = "نام مستعار باید دست‌کم ۲ نویسه داشته باشد.";
    if (useAlias && aliasLength > 80)
      nextErrors.alias = "نام مستعار نمی‌تواند بیشتر از ۸۰ نویسه باشد.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      if (nextErrors.alias) aliasInputRef.current?.focus();
      else bodyInputRef.current?.focus();
      return;
    }

    setSubmitting(true);
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
      if (!response.ok) {
        const responseBody = await response.json().catch(() => null);
        const errors = readFieldErrors(responseBody);
        setFieldErrors(errors);
        if (errors.alias) aliasInputRef.current?.focus();
        else if (errors.body) bodyInputRef.current?.focus();
        throw new Error("submit failed");
      }
      setBody("");
      setAlias("");
      setFieldErrors({});
      setMessage("دیدگاه شما ثبت شد و پس از بررسی نمایش داده می‌شود.");
    } catch {
      setMessage("ارسال دیدگاه انجام نشد. لطفاً دوباره تلاش کنید.");
    } finally {
      setSubmitting(false);
    }
  }
  return (
    <form onSubmit={submit} noValidate className="space-y-3 rounded-xl bg-slate-50 p-4">
      {isAdmin && !parentId && (
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={useAlias}
            onChange={(e) => {
              setUseAlias(e.target.checked);
              setFieldErrors((current) => ({ ...current, alias: undefined }));
            }}
          />{" "}
          ثبت با نام مستعار
        </label>
      )}
      {useAlias && !parentId && (
        <label className="block">
          نام مستعار
          <input
            ref={aliasInputRef}
            className="mt-1 block w-full rounded border border-slate-300 p-2"
            value={alias}
            onChange={(e) => {
              setAlias(limitCodePoints(e.target.value, 80));
              setFieldErrors((current) => ({ ...current, alias: undefined }));
            }}
            maxLength={160}
            aria-invalid={Boolean(fieldErrors.alias)}
            aria-required="true"
            aria-describedby={fieldErrors.alias ? `${aliasHelpId} ${aliasErrorId}` : aliasHelpId}
          />
          <p id={aliasHelpId} className="mt-1 text-sm text-slate-600">
            ۲ تا ۸۰ نویسه؛ {Array.from(alias.trim()).length} نویسه
          </p>
          {fieldErrors.alias && (
            <p id={aliasErrorId} role="alert" className="text-sm text-red-700">
              {fieldErrors.alias}
            </p>
          )}
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
          ref={bodyInputRef}
          className="mt-1 block w-full rounded border border-slate-300 p-2"
          value={body}
          onChange={(e) => {
            setBody(limitCodePoints(e.target.value, 2000));
            setFieldErrors((current) => ({ ...current, body: undefined }));
          }}
          maxLength={4000}
          aria-invalid={Boolean(fieldErrors.body)}
          aria-required="true"
          aria-describedby={fieldErrors.body ? `${helpId} ${bodyErrorId}` : helpId}
        />
      </label>
      <p id={helpId} className="text-sm text-slate-600">
        ۱۰ تا ۲۰۰۰ نویسه؛ {Array.from(body.trim()).length} نویسه
      </p>
      {fieldErrors.body && (
        <p id={bodyErrorId} role="alert" className="text-sm text-red-700">
          {fieldErrors.body}
        </p>
      )}
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
