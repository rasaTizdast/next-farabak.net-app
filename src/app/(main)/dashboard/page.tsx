"use client";

import Link from "next/link";

import LoadingSpinner from "@/app/_components/ui/LoadingSpinner";
import { useUser } from "@/context/UserContext";

const actionCards = [
  {
    title: "ویرایش اطلاعات",
    desc: "اطلاعات تماس و مشخصات حساب خود را به‌روز نگه دارید.",
    link: "/dashboard/edit-user",
    action: "تکمیل پروفایل",
  },
  {
    title: "تغییر کلمه عبور",
    desc: "برای حفظ امنیت حساب، یک کلمه عبور تازه و مطمئن انتخاب کنید.",
    link: "/dashboard/change-password",
    action: "مدیریت امنیت",
  },
  {
    title: "ثبت فاکتور جدید",
    desc: "محصولات مورد نیازتان را انتخاب کنید و یک فاکتور جدید بسازید.",
    link: "/dashboard/new-invoice",
    action: "شروع فاکتور",
  },
  {
    title: "فاکتور‌های قبلی",
    desc: "فاکتورهای ثبت‌شده را مرور کنید و جزئیات هر سفارش را ببینید.",
    link: "/dashboard/all-invoices",
    action: "مشاهده فاکتورها",
  },
];

const MainDashboardPage = () => {
  const { user, userFullName, loading } = useUser();

  if (loading) {
    return (
      <div
        className="flex min-h-40 items-center justify-center"
        role="status"
        aria-label="در حال بارگذاری"
      >
        <LoadingSpinner />
      </div>
    );
  }

  const displayName = userFullName?.trim() || "کاربر عزیز";

  return (
    <div className="flex w-full max-w-6xl flex-col gap-6 sm:gap-8">
      <header className="border-b border-slate-200 pb-6">
        <p className="mb-2 text-sm font-semibold text-(--farabak-action-blue)">میز کار شخصی</p>
        <h1 className="text-2xl font-extrabold tracking-tight text-(--farabak-ink-deep) sm:text-3xl">
          سلام، {displayName}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-(--farabak-ink-muted) sm:text-base">
          کارهای حساب و فاکتورهای خود را از اینجا با چند قدم روشن مدیریت کنید.
        </p>
      </header>

      <section
        aria-labelledby="account-summary-title"
        className="grid gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center sm:p-6"
      >
        <div>
          <h2 id="account-summary-title" className="text-lg font-bold text-(--farabak-ink-deep)">
            خلاصه حساب
          </h2>
          <dl className="mt-4 grid gap-3 text-sm text-(--farabak-ink-muted) sm:grid-cols-2">
            <div>
              <dt className="text-xs text-slate-500">ایمیل</dt>
              <dd className="mt-1 font-medium text-slate-800" dir="ltr">
                {user?.email || "ثبت نشده"}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">شماره تماس</dt>
              <dd className="mt-1 font-medium text-slate-800" dir="ltr">
                {user?.phoneNumber || "ثبت نشده"}
              </dd>
            </div>
          </dl>
        </div>
        <Link
          href="/dashboard/edit-user"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-(--farabak-action-blue) px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-(--farabak-ink-deep) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) motion-reduce:transition-none"
        >
          ویرایش اطلاعات
        </Link>
      </section>

      <section aria-labelledby="account-actions-title">
        <div className="mb-4">
          <h2 id="account-actions-title" className="text-xl font-bold text-(--farabak-ink-deep)">
            از اینجا شروع کنید
          </h2>
          <p className="mt-1 text-sm text-(--farabak-ink-muted)">
            یک کار را انتخاب کنید و ادامه دهید.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {actionCards.map((card) => (
            <article
              key={card.link}
              className="flex min-h-52 flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-base font-bold text-(--farabak-ink-deep)">{card.title}</h3>
              <p className="mt-3 text-sm leading-7 text-(--farabak-ink-muted)">{card.desc}</p>
              <Link
                href={card.link}
                className="mt-auto inline-flex min-h-11 items-center justify-center rounded-xl border border-(--farabak-action-blue) px-4 py-2 text-sm font-semibold text-(--farabak-action-blue) transition-colors hover:bg-(--farabak-action-blue) hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--farabak-action-blue) motion-reduce:transition-none"
              >
                {card.action}
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default MainDashboardPage;
