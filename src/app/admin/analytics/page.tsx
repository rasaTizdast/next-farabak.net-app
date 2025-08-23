"use client";

import Link from "next/link";
import React, { useState } from "react";
import { BiLinkExternal } from "react-icons/bi";
import { FaChartArea, FaUsers } from "react-icons/fa";
import { MdBarChart } from "react-icons/md";

// Define the CardColor type
type CardColor = "blue" | "green" | "purple";

const AnalyticsOverview = () => {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  // Color mapping object with the correct type
  const colorMap: Record<CardColor, { bg: string; border: string; text: string }> = {
    blue: {
      bg: "bg-blue-100",
      border: "border-blue-500",
      text: "text-blue-500",
    },
    green: {
      bg: "bg-green-100",
      border: "border-green-500",
      text: "text-green-500",
    },
    purple: {
      bg: "bg-purple-100",
      border: "border-purple-500",
      text: "text-purple-500",
    },
  };

  const cards = [
    {
      id: 1,
      title: "بینش‌های بازدیدکنندگان",
      description:
        "شما می‌توانید تعداد بازدیدکنندگان منحصر به فرد، بازدیدهای صفحه و الگوهای رفتاری کاربران را پیگیری کنید.",
      icon: <FaUsers className="mb-6 h-10 w-10" />,
      color: "blue" as CardColor, // Explicitly specify the type
    },
    {
      id: 2,
      title: "معیارهای عملکرد وبسایت",
      description:
        "در این قسمت می‌توانید نرخ پرش، مدت زمان هر بازدید و اهداف تبدیل کاربران را نظارت کنید.",
      icon: <MdBarChart className="mb-6 h-10 w-10" />,
      color: "green" as CardColor,
    },
    {
      id: 3,
      title: "گزارش‌های سفارشی و دقیق",
      description:
        "با این ابزار می‌توانید گزارش‌های دقیق و خروجی داده‌ها برای تحلیل‌های بیشتر ایجاد کنید.",
      icon: <FaChartArea className="mb-6 h-10 w-10" />,
      color: "purple" as CardColor,
    },
  ];

  return (
    <div className="rounded-lg bg-gradient-to-tr from-gray-800 to-gray-900 p-4 sm:p-8">
      <div className="mx-auto max-w-6xl space-y-12">
        {/* Header with subtle animation */}
        <div className="space-y-4 text-center">
          <h1 className="text-2xl font-bold text-gray-200 transition-colors duration-300 hover:text-blue-200 md:text-3xl lg:text-5xl">
            تحلیل وبسایت شما
          </h1>
          <p className="mx-auto max-w-3xl text-base text-gray-400 md:text-lg lg:text-xl">
            عملکرد وبسایت خود را با استفاده از تحلیل‌های دقیق و معیارهای کاربردی پیگیری کنید
          </p>
          <div className="mx-auto mt-6 h-1 w-24 rounded-full bg-blue-500"></div>
        </div>

        {/* Enhanced Analytics Preview Cards */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`relative transform overflow-hidden rounded-xl bg-gray-950 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-8 ${
                hoveredCard === card.id ? colorMap[card.color].border : "border-transparent"
              } border-2`}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className={`absolute right-0 top-0 -mr-8 -mt-8 h-24 w-24 rounded-full ${
                  colorMap[card.color].bg
                } opacity-80 transition-transform duration-300 ${hoveredCard === card.id ? "scale-[1.8]" : "scale-100"}`}
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
        <div className="relative space-y-4 overflow-hidden rounded-xl bg-gray-950 p-8 text-center shadow-lg">
          <div className="absolute left-0 top-0 h-2 w-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>
          <h2 className="mt-0 text-2xl font-bold text-gray-100 transition-colors duration-300 hover:text-blue-600 lg:text-3xl">
            آماده‌اید برای مشاهده دقیق‌تر تحلیل‌های وبسایت شما؟
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-relaxed text-gray-400">
            با دسترسی به پنل تحلیلی، آمار جامع و گزارش‌های دقیق عملکرد وبسایت خود را مشاهده کنید.
          </p>
          <Link
            href={process.env.NEXT_PUBLIC_UMAMI_ANALYTICS_PAGE as string}
            passHref
            target="_blank"
            className="inline-flex transform items-center gap-3 rounded-xl bg-blue-600 px-8 py-4 text-xs font-medium text-white transition-all duration-300 hover:-translate-y-1 hover:bg-blue-700 hover:shadow-lg sm:text-base"
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
