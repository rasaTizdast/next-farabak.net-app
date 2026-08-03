"use client";

import { message } from "antd";
import { useState } from "react";

export function useWarrantyStats() {
  const [activeTab, setActiveTab] = useState<string>("branches");

  const handleTabChange = (key: string) => {
    setActiveTab(key);

    if (key === "warranty-stats") {
      message.info("در حال بارگیری آمار گارانتی‌ها...", 0.5);
    } else if (key === "warranty-requests") {
      message.info("در حال بارگیری درخواست‌های بررسی...", 0.5);
    }
  };

  return { activeTab, setActiveTab, handleTabChange };
}
