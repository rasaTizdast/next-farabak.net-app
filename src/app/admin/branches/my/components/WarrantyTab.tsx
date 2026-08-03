"use client";

import { Card } from "antd";
import WarrantyRequests from "../../components/WarrantyRequests";
import WarrantyStats from "./WarrantyStats";

interface WarrantyTabProps {
  tabKey: "warranty-requests" | "warranty-stats";
}

export default function WarrantyTab({ tabKey }: WarrantyTabProps) {
  if (tabKey === "warranty-requests") {
    return (
      <Card
        className="overflow-hidden rounded-lg border-0 bg-gray-800 text-white"
        bodyStyle={{
          backgroundColor: "#19202b",
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