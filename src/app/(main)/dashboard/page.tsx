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
      <h3 className="font-extrabold">کاربر گرامی، {userFullName} خوش‌آمدید</h3>

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
    <div className="flex w-full max-w-[450px] flex-col items-center rounded-[8px] bg-white px-4 py-6 text-center shadow-[0_4px_10px_rgba(0,0,0,0.1)] min-[769px]:w-[30%] min-[769px]:max-w-[400px] min-[769px]:min-w-[250px] min-[993px]:min-w-[350px]">
      <div className="mb-4 text-[1rem] font-bold min-[993px]:text-[1.1rem] min-[1201px]:text-[1.2rem]">
        {title}
      </div>
      <p className="mt-2 mb-8 text-[0.8rem] font-light min-[993px]:text-base min-[1201px]:text-[1.1rem]">
        {desc}
      </p>
      <Link
        href={link}
        className="mt-auto inline-block cursor-pointer rounded-[6px] bg-[#003262] px-6 py-2 text-[0.8rem] text-white transition-[transform,background-color,box-shadow] duration-300 hover:scale-[1.05] hover:bg-[#000814] hover:shadow-[0_4px_10px_rgba(0,0,0,0.3)] min-[993px]:text-base"
      >
        رفتن به صفحه
      </Link>
    </div>
  );
};
