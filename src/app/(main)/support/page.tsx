import { Metadata } from "next";
import Link from "next/link";

import Breadcrumb from "@/app/_components/ui/Breadcrumb";
import supportData from "@/constants/supportData.json";

export const metadata: Metadata = {
  title: "پشتیبانی مشتریان فرابک | گارانتی و سوالات متداول",
  description:
    "در بخش پشتیبانی فرابک، به دانلود نرم‌افزارها، پیگیری گارانتی، سوالات متداول و مقالات آموزشی دسترسی پیدا کنید. پشتیبانی حرفه‌ای برای محصولات امنیتی مانند ریولینک و بلک مجیک",
  robots: {
    index: true,
    follow: true,
  },
};

const SupportPage = () => {
  return (
    <section className="flex w-full flex-col items-center px-6 py-4 min-[992px]:px-16 min-[1200px]:px-24 md:px-12 2xl:px-40">
      <div className="w-full max-w-[1580px]">
        <Breadcrumb breadcrumbs={["/", "/support"]} />
        <div className="flex w-full flex-wrap items-stretch justify-evenly gap-8">
          {supportData.map((item) => (
            <Card key={item.id} title={item.title} desc={item.desc} link={item.link} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default SupportPage;

type CardProps = {
  title: string;
  desc: string;
  link: string;
};

const Card = ({ title, desc, link }: CardProps) => {
  return (
    <div className="flex max-w-[300px] flex-col items-center justify-between gap-4 rounded-lg bg-white p-4 text-center shadow-[0_4px_10px_rgba(0,0,0,0.1)]">
      <h2 className="text-[1.3rem] font-bold">{title}</h2>
      <p>{desc}</p>
      <Link
        href={`/support/${link}`}
        className="bg-third after:bg-fourth relative mt-8 inline-block w-full overflow-hidden rounded-lg px-8 py-2 text-[0.9rem] text-white transition-[transform,color,box-shadow] duration-300 after:absolute after:inset-y-0 after:inset-s-[100%] after:inset-e-0 after:z-[-1] after:transition-[inset-inline-start,inset-inline-end] after:duration-500 hover:scale-[1.03] hover:text-white hover:shadow-[0_6px_12px_rgba(0,0,0,0.2)] hover:after:inset-s-0 hover:after:inset-e-0"
      >
        مشاهده
      </Link>
    </div>
  );
};
