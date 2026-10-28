"use client";

import Link from "next/link";

import LoadingSpinner from "@/app/_components/ui/LoadingSpinner";
import { useUser } from "@/context/UserContext";

const MainDashboardPage = () => {
  const { userFullName, loading } = useUser();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <h1 className="text-xl font-extrabold text-slate-900">
        کاربر گرامی، {userFullName} خوش‌آمدید
      </h1>

      <div className="mt-4 flex w-full flex-wrap justify-center gap-8 min-[577px]:mt-8 min-[769px]:justify-start">
        <Card
          title="ثبت فاکتور جدید"
          desc="ثبت یک فاکتور جدید با محصولاتی که نشان شده‌اند یا میخواهید انتخاب کنید."
          link="/dashboard/new-invoice"
        />
        <Card
          title="فاکتور های قبلی"
          desc="مشاهده تمامی فاکتور هایی که قبلا ثبت شده‌اند."
          link="/dashboard/all-invoices"
        />
      </div>
    </>
  );
};
export default MainDashboardPage;

type CardProps = {
  title: string;
  desc: string;
  link: string;
};

const Card = ({ title, desc, link }: CardProps) => {
  return (
    <div className="flex w-full max-w-[450px] flex-col items-center rounded-xl border border-slate-200 bg-white px-4 py-6 text-center shadow-sm min-[769px]:w-[30%] min-[769px]:max-w-[400px] min-[769px]:min-w-[250px] min-[993px]:min-w-[350px]">
      <div className="mb-4 text-[1rem] font-bold min-[993px]:text-[1.1rem] min-[1201px]:text-[1.2rem]">
        {title}
      </div>
      <p className="mt-2 mb-8 text-sm leading-7 text-slate-700 min-[993px]:text-base">{desc}</p>
      <Link
        href={link}
        className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg bg-[#003262] px-6 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#000814] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700 min-[993px]:text-base"
      >
        رفتن به صفحه
      </Link>
    </div>
  );
};
