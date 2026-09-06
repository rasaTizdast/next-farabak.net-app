"use client";

import Link from "next/link";
import React, { useState } from "react";
import { BiLinkExternal } from "react-icons/bi";
import { FaChartArea, FaUsers } from "react-icons/fa";
import { MdBarChart } from "react-icons/md";

import { cn } from "@/lib/utils";

// Define the CardColor type
type CardColor = "blue" | "green" | "purple";

const colorMap: Record<CardColor, { bg: string; border: string; iconBg: string; text?: string }> = {
  blue: {
    bg: "bg-gray-950",
    border: "border-[var(--primary)]",
    iconBg: "bg-blue-500/10",
  },
  green: {
    bg: "bg-gray-950",
    border: "border-[var(--secondary)]",
    iconBg: "bg-green-500/10",
  },
  purple: {
    bg: "bg-gray-950",
    border: "border-[var(--dark-blue)]",
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

const AnalyticsOverview = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  return (
    <div className="rounded-xl bg-gray-950 p-8 sm:p-10">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header with subtle animation */}
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-gray-200 transition-colors duration-300 hover:text-blue-200 md:text-3xl lg:text-5xl">
            تحلیل وبسایت شما
          </h1>
          <p className="mx-auto max-w-3xl text-base text-gray-400 md:text-lg lg:text-xl">
            عملکرد وبسایت خود را با استفاده از تحلیل‌های دقیق و معیارهای userable پیگیری کنید
          </p>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-blue-500"></div>
        </div>

        {/* Enhanced Analytics Preview Cards */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className={cn(
                `relative transform overflow-hidden rounded-xl border bg-gray-800 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${hoveredCard === card.id ? `border-[var(${card.color})]` : "border-transparent"}`
              )}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className={`absolute top-0 right-0 -mt-8 -mr-8 size-24 rounded-full ${colorMap[card.color].iconBg} opacity-80 transition-transform duration-300 ${hoveredCard === card.id ? "scale-[1.8]" : "scale-100"}`}
              ></div>
              <div className="relative">
                <div
                  className={`${
                    colorMap[card.color].text
                  } transition-transform duration-300 ${hoveredCard === card.id ? "scale-110" : "scale-100"}`}
                >
                  {card.icon}
                </div>
                <h3 className="mb-4 text-xl font-bold text-gray-100">{card.title}</h3>
                <p className="leading-relaxed text-gray-400">{card.description}</p>
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
          <p className={cn("mx-auto max-w-2xl text-base leading-relaxed text-gray-400")}>
            با دسترسی به پنل تحلیلی، آمار جامع و گزارش‌های دقیق عملکرد وبسایت خود را مشاهده کنید.
          </p>
          <Link
            href={process.env.NEXT_PUBLIC_UMAMI_ANALYTICS_PAGE as string}
            passHref
            target="_blank"
            className={cn(
              "inline-flex transform items-center gap-3 rounded-xl bg-(--primary) px-8 py-4 text-xs font-medium text-white transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-1 hover:bg-(--secondary) hover:shadow-lg sm:text-base"
            )}
          >
            مشاهده تحلیل‌های دقیق‌تر
            <BiLinkExternal className="animate-pulse" size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsOverview;
