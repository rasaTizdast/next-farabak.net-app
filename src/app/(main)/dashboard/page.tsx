"use client";

import Link from "next/link";
import { useUser } from "@/context/UserContext";

import styles from "./MainDashboardPage.module.css";

const MainDashboardPage = () => {
  const { userFullName, loading } = useUser();

  if (loading) {
    return <LoadingSpinner />; // Show spinner while loading
  }

  return (
    <>
      <h3 className={styles.pageTitle}>
        کاربر گرامی، {userFullName} خوش‌آمدید
      </h3>

      <div className={styles.cardParent}>
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
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      <p>{desc}</p>
      <Link href={link}>رفتن به صفحه</Link>
    </div>
  );
};

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-center w-24 h-24">
        <div className="w-10 h-10 border-4 border-[#0e6aff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    </div>
  );
};
