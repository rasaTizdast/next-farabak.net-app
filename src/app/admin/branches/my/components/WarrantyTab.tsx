"use client";

import { Card } from "antd";

import { adminColors } from "@/constants/adminColors";

import WarrantyStats from "./WarrantyStats";
import WarrantyRequests from "../../components/WarrantyRequests";

interface WarrantyTabProps {
  tabKey: "warranty-requests" | "warranty-stats";
}

export default function WarrantyTab({ tabKey }: WarrantyTabProps) {
  if (tabKey === "warranty-requests") {
    return (
      <Card
        className="overflow-hidden rounded-lg border-0 bg-gray-800 text-white"
        bodyStyle={{
          backgroundColor: adminColors.panelAlt,
          padding: "16px 20px",
          fontFamily: "inherit",
        }}
      >
        <WarrantyRequests isTabActive={true} />
      </Card>
    );
  }

  return (
    <Card
      className="overflow-hidden rounded-lg border-0 bg-gray-800 text-white"
      bodyStyle={{
        padding: "16px 20px",
        fontFamily: "inherit",
      }}
    >
      <WarrantyStats isTabActive={true} />
    </Card>
  );
}
