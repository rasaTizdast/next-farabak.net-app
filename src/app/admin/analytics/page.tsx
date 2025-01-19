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
  const colorMap: Record<
    CardColor,
    { bg: string; border: string; text: string }
  > = {
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
      icon: <FaUsers className="h-10 w-10 mb-6" />,
      color: "blue" as CardColor, // Explicitly specify the type
    },
    {
      id: 2,
      title: "معیارهای عملکرد وبسایت",
      description:
        "در این قسمت می‌توانید نرخ پرش، مدت زمان هر بازدید و اهداف تبدیل کاربران را نظارت کنید.",
      icon: <MdBarChart className="h-10 w-10 mb-6" />,
      color: "green" as CardColor,
    },
    {
      id: 3,
      title: "گزارش‌های سفارشی و دقیق",
      description:
        "با این ابزار می‌توانید گزارش‌های دقیق و خروجی داده‌ها برای تحلیل‌های بیشتر ایجاد کنید.",
      icon: <FaChartArea className="h-10 w-10 mb-6" />,
      color: "purple" as CardColor,
    },
  ];

  return (
    <div className="bg-gradient-to-tr from-gray-800 to-gray-900 p-4 sm:p-8 rounded-lg">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header with subtle animation */}
        <div className="space-y-4 text-center">
          <h1 className="text-2xl md:text-3xl lg:text-5xl font-bold text-gray-200 hover:text-blue-200 transition-colors duration-300">
            تحلیل وبسایت شما
          </h1>
          <p className="text-base md:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto">
            عملکرد وبسایت خود را با استفاده از تحلیل‌های دقیق و معیارهای کاربردی
            پیگیری کنید
          </p>
          <div className="w-24 h-1 bg-blue-500 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Enhanced Analytics Preview Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`bg-gray-950 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 p-4 sm:p-8 
                transform hover:-translate-y-1 relative overflow-hidden
                ${
                  hoveredCard === card.id
                    ? colorMap[card.color].border
                    : "border-transparent"
                } border-2`}
              onMouseEnter={() => setHoveredCard(card.id)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div
                className={`absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full 
                ${
                  colorMap[card.color].bg
                } opacity-80 transition-transform duration-300
                ${hoveredCard === card.id ? "scale-[1.8]" : "scale-100"}`}
              ></div>
              <div className="relative">
                <div
                  className={`${
                    colorMap[card.color].text
                  } transition-transform duration-300
                  ${hoveredCard === card.id ? "scale-110" : "scale-100"}`}
                >
                  {card.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-4">
                  {card.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Enhanced Call to Action */}
        <div className="bg-gray-950 rounded-xl shadow-lg p-8 text-center space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>
          <h2 className="text-2xl lg:text-3xl font-bold mt-0 text-gray-100 hover:text-blue-600 transition-colors duration-300">
            آماده‌اید برای مشاهده دقیق‌تر تحلیل‌های وبسایت شما؟
          </h2>
          <p className="text-base text-gray-400 max-w-2xl mx-auto leading-relaxed">
            با دسترسی به پنل تحلیلی، آمار جامع و گزارش‌های دقیق عملکرد
            وبسایت خود را مشاهده کنید.
          </p>
          <Link
            href="https://analytics.umami.is/share/your-id"
            target="_blank"
            className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 
            text-white text-xs sm:text-base font-medium rounded-xl transition-all duration-300
            hover:shadow-lg transform hover:-translate-y-1"
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
