"use client";

import { Card } from "antd";

import { adminColors } from "@/constants/adminColors";

import { Branch, toPersianDate } from "../../components/types";

interface BranchInfoProps {
  branch: Branch;
}

export default function BranchInfo({ branch }: BranchInfoProps) {
  return (
    <Card
      title={<span className="text-lg">اطلاعات شعبه</span>}
      className="mb-6 overflow-hidden rounded-lg bg-gray-800 text-white shadow-md"
      headStyle={{
        backgroundColor: adminColors.panel,
        borderBottom: `1px solid ${adminColors.border}`,
        color: adminColors.textBright,
        padding: "12px 16px",
      }}
      bodyStyle={{ backgroundColor: adminColors.panel, padding: "16px" }}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded bg-gray-900/30 p-2">
          <p className="mb-1 text-sm text-gray-400">نام شعبه:</p>
          <p className="text-lg font-medium">{branch.name}</p>
        </div>
        <div className="rounded bg-gray-900/30 p-2">
          <p className="mb-1 text-sm text-gray-400">کد شعبه:</p>
          <p className="text-lg font-medium">{branch.location}</p>
        </div>
        <div className="rounded bg-gray-900/30 p-2">
          <p className="mb-1 text-sm text-gray-400">تاریخ ایجاد:</p>
          <p className="text-lg font-medium">{toPersianDate(branch.createdat)}</p>
        </div>
        <div className="rounded bg-gray-900/30 p-2">
          <p className="mb-1 text-sm text-gray-400">تعداد محصولات:</p>
          <div className="flex items-center gap-2">
            <span className="text-lg font-medium">{branch.productCount} نوع محصول</span>
            <span className="rounded-md bg-blue-800/70 px-2 py-0.5 text-sm text-blue-100">
              {branch.totalQuantity} عدد
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
