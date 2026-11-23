"use client";

import { useCallback, useEffect, useState } from "react";

type ContactSubmission = {
  id: number;
  name: string;
  phone: string;
  project: string | null;
  message: string;
  createdAt: string;
};

type ContactSubmissionPage = {
  items: ContactSubmission[];
  nextCursor: number | null;
};

const receivedAtFormatter = new Intl.DateTimeFormat("fa-IR", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "Asia/Tehran",
});

export default function ContactSubmissionsPage() {
  const [items, setItems] = useState<ContactSubmission[]>([]);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [retryCursor, setRetryCursor] = useState<number | null>(null);

  const loadPage = useCallback(async (cursor?: number, append = false) => {
    setIsLoading(true);
    setError(false);

    const url = cursor
      ? `/api/admin/contact-submissions?cursor=${encodeURIComponent(String(cursor))}`
      : "/api/admin/contact-submissions";

    try {
      const response = await fetch(url, { cache: "no-store" });
      if (!response.ok) throw new Error("Contact submissions request failed");

      const page = (await response.json()) as ContactSubmissionPage;
      if (
        !Array.isArray(page.items) ||
        !(page.nextCursor === null || Number.isInteger(page.nextCursor))
      ) {
        throw new Error("Invalid contact submissions response");
      }

      setItems((current) => {
        if (!append) return page.items;
        const merged = new Map(current.map((item) => [item.id, item]));
        for (const item of page.items) {
          if (!merged.has(item.id)) merged.set(item.id, item);
        }
        return Array.from(merged.values());
      });
      setNextCursor(page.nextCursor);
      setRetryCursor(null);
    } catch {
      setError(true);
      setRetryCursor(cursor ?? null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPage();
  }, [loadPage]);

  const retry = () => {
    void loadPage(retryCursor ?? undefined, retryCursor !== null);
  };

  return (
    <section aria-labelledby="contact-submissions-title" className="space-y-6">
      <header>
        <h1 id="contact-submissions-title" className="text-xl font-bold text-white sm:text-2xl">
          پیام‌های تماس
        </h1>
        <p className="mt-2 text-sm leading-7 text-slate-300">
          درخواست‌هایی که از فرم تماس سایت ثبت شده‌اند.
        </p>
      </header>

      {isLoading ? (
        <p
          className="rounded-xl border border-slate-700 bg-slate-900 p-5 text-sm text-slate-200"
          role="status"
          aria-live="polite"
        >
          {items.length === 0 ? "در حال دریافت پیام‌ها…" : "در حال دریافت پیام‌های قدیمی‌تر…"}
        </p>
      ) : null}

      {error ? (
        <div className="flex flex-col gap-3 rounded-xl border border-red-400/40 bg-red-950/40 p-5 text-sm text-red-100 sm:flex-row sm:items-center sm:justify-between">
          <p role="alert">دریافت پیام‌ها ناموفق بود. لطفاً دوباره تلاش کنید.</p>
          <button
            type="button"
            className="min-h-11 rounded-lg border border-red-200/40 px-4 font-semibold text-white hover:bg-red-900/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            onClick={retry}
          >
            تلاش دوباره
          </button>
        </div>
      ) : null}

      {!isLoading && !error && items.length === 0 ? (
        <p
          role="status"
          className="rounded-xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center leading-8 text-slate-300"
        >
          هنوز پیامی دریافت نشده است.
        </p>
      ) : null}

      {items.length > 0 ? (
        <ol aria-label="پیام‌های دریافتی" className="space-y-4">
          {items.map((item) => (
            <li key={item.id}>
              <article
                aria-labelledby={`contact-submission-${item.id}-name`}
                className="rounded-xl border border-slate-700 bg-slate-900 p-5 shadow-sm sm:p-6"
              >
                <div className="flex flex-col gap-2 border-b border-slate-700 pb-4 sm:flex-row sm:items-start sm:justify-between">
                  <h2
                    id={`contact-submission-${item.id}-name`}
                    className="text-lg font-semibold text-white"
                  >
                    {item.name}
                  </h2>
                  <time
                    className="text-sm text-slate-300"
                    dateTime={item.createdAt}
                    title={new Date(item.createdAt).toISOString()}
                  >
                    {receivedAtFormatter.format(new Date(item.createdAt))}
                  </time>
                </div>

                <dl className="mt-4 grid gap-4 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-slate-400">شماره تماس</dt>
                    <dd className="mt-1 font-medium text-slate-100">
                      <bdi dir="ltr">{item.phone}</bdi>
                    </dd>
                  </div>
                  {item.project ? (
                    <div>
                      <dt className="text-slate-400">نوع پروژه یا تجهیز</dt>
                      <dd className="mt-1 font-medium text-slate-100">{item.project}</dd>
                    </div>
                  ) : null}
                </dl>

                <div className="mt-5 border-t border-slate-700 pt-4">
                  <h3 className="text-sm font-semibold text-slate-300">شرح پیام</h3>
                  <p className="mt-2 leading-8 whitespace-pre-wrap text-slate-100">
                    {item.message}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ol>
      ) : null}

      {nextCursor !== null ? (
        <button
          type="button"
          disabled={isLoading}
          className="min-h-11 rounded-lg border border-blue-300/50 px-5 font-semibold text-blue-100 transition-colors hover:bg-blue-950/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-200 disabled:cursor-wait disabled:opacity-60"
          onClick={() => void loadPage(nextCursor, true)}
        >
          {isLoading ? "در حال دریافت…" : "نمایش پیام‌های قدیمی‌تر"}
        </button>
      ) : null}
    </section>
  );
}
