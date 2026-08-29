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

      <div className="mt-8 flex w-full flex-wrap justify-start gap-8">
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
    <div className="flex w-[30%] max-w-[400px] min-w-[350px] flex-col items-center rounded-lg bg-white px-4 py-6 text-center shadow-[0_4px_10px_rgba(0,0,0,0.1)] md:min-w-[250px] lg:w-full lg:max-w-[450px]">
      <div className="mb-4 text-[1.1rem] font-bold md:text-[1.2rem] lg:text-[1rem]">{title}</div>
      <p className="my-2 text-base font-light md:text-[1.1rem] lg:text-[0.8rem]">{desc}</p>
      <Link
        href={link}
        className="mt-auto inline-block cursor-pointer rounded-[6px] bg-[#003262] px-6 py-2 text-base text-white transition-[transform,background-color,box-shadow] duration-300 hover:scale-[1.05] hover:bg-[#000814] hover:shadow-[0_4px_10px_rgba(0,0,0,0.3)] md:text-base lg:text-[0.8rem]"
      >
        رفتن به صفحه
      </Link>
    </div>
  );
};
