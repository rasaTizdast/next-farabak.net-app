"use client";

import Link from "next/link";

import LoadingSpinner from "@/app/_components/ui/LoadingSpinner";
import { useUser } from "@/context/UserContext";

import styles from "./MainDashboardPage.module.css";

const MainDashboardPage = () => {
  const { userFullName, loading } = useUser();

  if (loading) {
    return <LoadingSpinner />; // Show spinner while loading
  }

  return (
    <>
      <h3 className={styles.pageTitle}>کاربر گرامی، {userFullName} خوش‌آمدید</h3>

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
