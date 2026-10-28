"use client";

import Link from "next/link";
import React from "react";
import { BiLinkExternal } from "react-icons/bi";
import { FaChartArea, FaUsers } from "react-icons/fa";
import { MdBarChart } from "react-icons/md";

import { cn } from "@/lib/utils";

// Define the CardColor type
type CardColor = "blue" | "green" | "purple";

const colorMap: Record<CardColor, { iconBg: string }> = {
  blue: {
    iconBg: "bg-blue-500/10",
  },
  green: {
    iconBg: "bg-green-500/10",
  },
  purple: {
    iconBg: "bg-purple-500/10",
  },
};

const cards = [
  {
    id: 1,
    title: "بینش‌های بازدیدکنندگان",
    description:
      "شما می‌توانید تعداد بازدیدکنندگان منحصر به فرد، بازدیدهای صفحه و الگوهای رفتاری کاربران را پیگیری کنید.",
    icon: <FaUsers className="mb-6 size-10" />,
    color: "blue" as CardColor,
  },
  {
    id: 2,
    title: "معیارهای عملکرد وبسایت",
    description:
      "در این قسمت می‌توانید نرخ پرش، مدت زمان هر بازدید و اهداف تبدیل کاربران را نظارت کنید.",
    icon: <MdBarChart className="mb-6 size-10" />,
    color: "green" as CardColor,
  },
  {
    id: 3,
    title: "گزارش‌های سفارشی و دقیق",
    description:
      "با این ابزار می‌توانید گزارش‌های دقیق و خروجی داده‌ها برای تحلیل‌های بیشتر ایجاد کنید.",
    icon: <FaChartArea className="mb-6 size-10" />,
    color: "purple" as CardColor,
  },
];

const getAnalyticsUrl = (value: string | undefined) => {
  if (!value) return undefined;

  try {
    const url = new URL(value);
    if (!["https:", "http:"].includes(url.protocol) || url.username || url.password) {
      return undefined;
    }

    return url.toString();
  } catch {
    return undefined;
  }
};

const AnalyticsOverview = () => {
  const analyticsUrl = getAnalyticsUrl(process.env.NEXT_PUBLIC_UMAMI_ANALYTICS_PAGE);

  return (
    <div className="rounded-xl bg-gray-950 p-4 sm:p-8 lg:p-10" aria-labelledby="analytics-title">
      <div className="space-y-8 sm:space-y-12">
        {/* Header with subtle animation */}
        <div className="space-y-4 text-center">
          <h1
            id="analytics-title"
            className="text-2xl font-bold text-gray-100 md:text-3xl lg:text-5xl"
          >
            تحلیل وبسایت شما
          </h1>
          <p className="mx-auto max-w-3xl text-base text-gray-300 md:text-lg lg:text-xl">
            عملکرد وبسایت خود را با استفاده از تحلیل‌های دقیق و معیارهای کاربردی پیگیری کنید
          </p>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-blue-500"></div>
        </div>

        {/* Enhanced Analytics Preview Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className={cn(
                "group relative transform overflow-hidden rounded-xl border border-transparent bg-gray-800 p-5 shadow-sm transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-gray-600 hover:shadow-lg motion-reduce:transform-none motion-reduce:transition-none sm:p-6"
              )}
            >
              <div
                aria-hidden="true"
                className={`absolute top-0 right-0 -mt-8 -mr-8 size-24 rounded-full ${colorMap[card.color].iconBg} opacity-80 transition-transform duration-300 group-hover:scale-[1.8] motion-reduce:transition-none`}
              />
              <div className="relative">
                <div
                  aria-hidden="true"
                  className="transition-transform duration-300 group-hover:scale-110 motion-reduce:transition-none"
                >
                  {card.icon}
                </div>
                <h2 className="mb-4 text-xl font-bold text-gray-100">{card.title}</h2>
                <p className="leading-relaxed text-gray-300">{card.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Call to Action */}
        <div
          className={cn(
            "relative space-y-4 overflow-hidden rounded-xl bg-gray-950 p-8 text-center shadow-lg"
          )}
        >
          <div
            className={cn(
              "absolute top-0 left-0 h-2 w-full bg-linear-to-r from-blue-500 via-purple-500 to-green-500"
            )}
          ></div>
          <h2
            className={cn(
              "mt-0 text-2xl font-bold text-gray-100 transition-colors duration-300 hover:text-blue-600 lg:text-3xl"
            )}
          >
            آماده‌اید برای مشاهده دقیق‌تر تحلیل‌های وبسایت شما؟
          </h2>
          <p className={cn("mx-auto max-w-2xl text-base leading-relaxed text-gray-300")}>
            با دسترسی به پنل تحلیلی، آمار جامع و گزارش‌های دقیق عملکرد وبسایت خود را مشاهده کنید.
          </p>
          {analyticsUrl ? (
            <Link
              href={analyticsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "bg-primary hover:bg-secondary inline-flex transform items-center gap-3 rounded-xl px-8 py-4 text-xs font-medium text-white transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-300 motion-reduce:transform-none motion-reduce:transition-none sm:text-base"
              )}
            >
              مشاهده تحلیل‌های دقیق‌تر
              <BiLinkExternal aria-hidden="true" className="motion-reduce:animate-none" size={20} />
            </Link>
          ) : (
            <p className="text-sm text-gray-400">پیوند پنل تحلیلی تنظیم نشده است.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
