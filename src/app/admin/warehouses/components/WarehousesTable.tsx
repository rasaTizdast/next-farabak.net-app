"use client";

import type { TableColumnsType } from "antd";

import { Button } from "@/components/ui/antd/Button";
import { DataTable } from "@/components/ui/antd/DataTable";

type Warehouse = {
  warehouseid: number;
  name: string;
  location: string | null;
  createdat: string | null;
  productCount: number;
  totalQuantity: number;
  specificProductQuantity?: number;
};

export default function WarehousesTable({
  items,
  loading,
  page,
  total,
  onPageChange,
  onEdit,
  onDelete,
  onProducts,
  isSearching,
}: {
  items: Warehouse[];
  loading: boolean;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  onEdit: (w: Warehouse) => void;
  onDelete: (w: Warehouse) => void;
  onProducts: (w: Warehouse) => void;
  isSearching?: boolean;
}) {
  const columns: TableColumnsType<Warehouse> = [
    { title: "نام", dataIndex: "name", key: "name" },
    { title: "مکان", dataIndex: "location", key: "location" },
    { title: "تعداد محصولات", dataIndex: "productCount", key: "productCount" },
    { title: "تعداد کل", dataIndex: "totalQuantity", key: "totalQuantity" },
    ...(isSearching
      ? [
          {
            title: "تعداد این محصول",
            key: "specificProductQuantity",
            render: (_: unknown, record: Warehouse) => (
              <span
                className={
                  (record.specificProductQuantity || 0) > 0
                    ? "rounded bg-green-900/40 px-2 py-0.5 text-green-200"
                    : "text-gray-300"
                }
              >
                {(record.specificProductQuantity ?? 0) > 0
                  ? `${record.specificProductQuantity} عدد`
                  : "ناموجود"}
              </span>
            ),
          },
        ]
      : []),
    {
      title: "عملیات",
      key: "actions",
      render: (_: unknown, record: Warehouse) => (
        <div className="flex gap-2">
          <Button
            variant="primary"
            onClick={() => onEdit(record)}
            className="flex items-center gap-2"
          >
            ویرایش
          </Button>
          <Button
            variant="danger"
            onClick={() => onDelete(record)}
            className="flex items-center gap-2"
          >
            حذف
          </Button>
          <Button
            variant="primary"
            onClick={() => onProducts(record)}
            className="flex items-center gap-2"
          >
            محصولات
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable<Warehouse>
      dataSource={items}
      rowKey={(r) => r.warehouseid}
      columns={columns}
      loading={loading}
      pagination={{ current: page, pageSize: 20, total, onChange: (p) => onPageChange(p) }}
    />
  );
}
